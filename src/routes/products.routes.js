import { Router } from "express";
import ProductManager from "../dao/ProductManager.js";
import { socketServer } from "../app.js"; // IMPORTAR SOCKET SERVER

const router = Router();
const productManager = new ProductManager();

/* ===========================   RUTAS DE PRODUCTOS   =========================== */

// Devuelve todos los productos
router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// Devuelve un producto específico según el id recibido por parámetro
router.get("/:pid", async (req, res) => {
  const pid = req.params.pid;
  const product = await productManager.getProductById(Number(pid));
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
});

// Crea un nuevo producto
router.post("/", async (req, res) => {
  try {
    // Agregar Producto
    const newProduct = req.body;
    const createdProduct = await productManager.addProduct(newProduct);

   // Emitir lista actualizada a todos los clientes
    const products = await productManager.getProducts();
    socketServer.emit("productosActuales", products);

   // Resonder al cliente HTTP
    res.status(201).json({ message: "Producto creado", product: createdProduct });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "No se pudo crear el producto" });
  }
});

// Actualiza un producto por su id
router.put("/:pid", async (req, res) => {
  const pid = Number(req.params.pid); // id que viene por la URL
  const updatedFields = req.body; // campos a actualizar (body)
  const updatedProduct = await productManager.updateProduct(pid, updatedFields);
  // Si no existe el producto
  if (!updatedProduct) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(updatedProduct);
});

// Elimina un producto por su id
router.delete("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid); // Elimina un producto por su id
    // Elimina el producto usando productManager
    const deletedProduct = await productManager.deleteProduct(pid);
    // Si no existe el producto, responder 404
    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtiene la lista actualizada y emite por websocket
    const products = await productManager.getProducts();
    socketServer.emit("productosActuales", products);

    // Responder al cliente http con el producto eliminado
    res.json(deletedProduct);
  } catch (error) {
    console.error("Error eliminando producto:", error);
    // Responder error 500 si falla la operación
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
});
export default router;
