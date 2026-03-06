import express from "express";
import { Server } from "socket.io";
import productsRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/carts.routes.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import viewRouter from "./routes/views.routes.js";
import ProductManager from "./dao/ProductManager.js";

const app = express();
const productManager = new ProductManager();

/* ===========================  SET Y ENGINE PARA VISTAS =========================== */
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

/* ===========================  ROUTER PARA LAS VISTAS =========================== */
app.use("/", viewRouter);

/* ===========================  MIDLEWARES =========================== */

app.use(express.json());
app.use(express.static(__dirname + "/public"));

/* ===========================  PRODUCTOS   =========================== */
app.use("/api/products", productsRoutes);

/* ===========================   CARRITO   =========================== */
app.use("/api/carts", cartRoutes);

/* =======  REFERENCIA AL SERVIDOR HTTP PARA QUE PUEDA INICIAR EL PROTOCOLO DE WEBSOCKETS === */
const httpServer = app.listen(8080, () => {
  console.log("Server funcionando");
});

/* ======= CON LA REFERENCIA, INICIAMOS EL PROTOCOLO DE WEBSOCKETS DESDE EL LADO DEL SERVIDOR ====== */
export const socketServer = new Server(httpServer);

socketServer.on("connection", async (socket) => {
  /* ==== CLIENTE CONECTADO  ====== */
  console.log("Cliente conectado");

  try {
    /* ==== OBTENER LA LISTA COMPLETA DE PRODUCTOS  ====== */
    const products = await productManager.getProducts();  

    /* ==== ENVIAR AL CLIENTE  ====== */
    socket.emit("productosActuales", products);
  } catch (error) {
    console.error("ERROR AL LEER PRODUCTOS:", error);
    socket.emit("productosActuales", []); // enviar array vacío si hay error
  }

  /* ==== ESCUCHAR NUEVO PRODUCTO  ====== */
  socket.on("nuevoProducto", async (productData) => {
    try {
      await productManager.addProduct(productData);
      const updatedProducts = await productManager.getProducts();
      socketServer.emit("productosActuales", updatedProducts);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      socket.emit("errorAgregarProducto", "No se pudo agregar el producto");
    }
  }); /* ==== FIN ESCUCHA NUEVO PRODUCTO  ====== */

  socket.on("eliminarProducto", async (pid) => {
    try {
      /* ==== ELIMINAR PRODUCTO EN products.json  ====== */
      await productManager.deleteProduct(Number(pid));
      /* ==== OBTENER LA LISTA ACTUALIZADA DE PRODUCTOS  ====== */
      const updatedProducts = await productManager.getProducts();
      /* ==== ENVIAR LA LISTA ACTUALIZADA A TODOS LOS CLIENTES  ====== */
      socketServer.emit("productosActuales", updatedProducts);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      socket.emit("errorEliminarProducto", "No se pudo eliminar el producto");
    }
  }); /* ==== FIN ESCUCHA ELIMINAR PRODUCTO  ====== */


}); /* ==== FIN CONEXIÓN CLIENTE  ====== */
