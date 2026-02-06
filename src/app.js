import express from "express";
import ProductManager from "./ProductManager.js";
import CartManager from "./CartManager.js";

const app = express();
const productManager = new ProductManager();
const cartManager = new CartManager();
app.use(express.json());

/* ===========================   RUTAS DE PRODUCTOS   =========================== */

// Devuelve todos los productos
app.get("/api/products", async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// Devuelve un producto específico según el id recibido por parámetro
app.get("/api/products/:pid", async (req, res) => {
  const pid = req.params.pid;
  const product = await productManager.getProductById(Number(pid));
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
});

// Crea un nuevo producto
app.post("/api/products", async (req, res) => {
  const newProduct = req.body;
  const createdProduct = await productManager.addProduct(newProduct);
  res.status(201).json(createdProduct);
});

// Actualiza un producto por su id
app.put("/api/products/:pid", async (req, res) => {
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
app.delete("/api/products/:pid", async (req, res) => {
  const pid = Number(req.params.pid); // id recibido por la URL
  const deletedProduct = await productManager.deleteProduct(pid);
  // Si no existe el producto
  if (!deletedProduct) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(deletedProduct);
});

/* ===========================   RUTAS DE CARRITO   =========================== */

// Crea un nuevo carrito
app.post("/api/carts", async (req, res) => {
  const newCart = await cartManager.addCart();
  res.status(201).json(newCart);
});

// Agrega un producto a un carrito
app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  const cid = Number(req.params.cid); // id del carrito
  const pid = Number(req.params.pid); // id del producto
  const updatedCart = await cartManager.addProductToCart(cid, pid);
  // Si no existe el carrito
  if (!updatedCart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.json(updatedCart);
});

// Devuelve los productos de un carrito por su id
app.get("/api/carts/:cid", async (req, res) => {
  const cid = Number(req.params.cid); // id del carrito
  const cart = await cartManager.getCartById(cid);
  // Si no existe el carrito
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.json(cart.products);
});

app.listen(8080, () => {
  console.log("Server funcionando");
});
