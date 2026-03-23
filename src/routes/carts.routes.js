import { Router } from "express";
import { cartModel } from "../model/cartModel.js";

const router = Router();

/* ===========================   RUTAS DE CARRITO   =========================== */

// ----------------------------  Crea un nuevo carrito   ----------------------
router.post("/", async (req, res) => {
  const newCart = await cartModel.create({});
  res.status(201).json(newCart);
});

// -------------------------- Agrega un producto a un carrito --------------------------
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await cartModel.findById(cid);
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  const existingProduct = cart.products.find((item) => {
    const productId = item.product._id
      ? item.product._id.toString()
      : item.product.toString();
    return productId === pid;
  });
  if (!existingProduct) {
    cart.products.push({ product: pid, quantity: 1 });
  } else {
    existingProduct.quantity += 1;
  }
  await cart.save();
  res.json({ message: "Producto agregado al carrito", cart });
});

// ----------------------------- Devuelve un carrito por su id con los productos ------------------
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  const cart = await cartModel
    .findById({ _id: cid })
    .populate("products.product");
  // Si no existe el carrito
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.json(cart.products);
});

// ---------------------- Actualiza SOLO la cantidad de un producto en el carrito ---------------------------
router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  //Validar cantidad
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }
  //Busco el carrito
  const cart = await cartModel.findById(cid);
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  //Busco el producto en el carrito
  const productInCart = cart.products.find((item) => {
    const productId = item.product._id
      ? item.product._id.toString()
      : item.product.toString();
    return productId === pid;
  });
  if (!productInCart) {
    return res.status(404).json({ error: "Producto no está en el carrito" });
  }
  //Actualizo la cantidad
  productInCart.quantity = quantity;
  //Guardo los cambios
  await cart.save();
  res.json({ message: "Cantidad actualizada", cart });
});

// ------------------------------------  Reemplaza TODOS los productos del carrito --------------------------
router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const products = req.body;
  // Valido el body
  if (!Array.isArray(products)) {
    return res
      .status(400)
      .json({ error: "El body debe ser un array de productos" });
  }
  //Busco el carrito
  const cart = await cartModel.findById(cid);
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  //Reemplazo los productod
  cart.products = products;
  //Guardo los cambios
  await cart.save();
  res.json({ message: "Carrito actualizado", cart });
});

// ---------------------------------- Elimina un producto del carrito ----------------------------
router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  // Busco el carrito
  const cart = await cartModel.findById({ _id: cid });
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  //Filtro los porductos
  cart.products = cart.products.filter(
    (product) => product.product._id.toString() !== pid,
  );
  // Guardo los cambios
  await cart.save();
  res.json({ message: "Producto eliminado del carrito", cart });
});

// ---------------------------------- Elimina todos los productos del carrito (vaciar carrito) --------------------
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
// Busco el carrito
  const cart = await cartModel.findById(cid);
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
 // Vacio el carrito
  cart.products = [];
 // Guardo los cambios
  await cart.save();
  res.json({ message: "Carrito vaciado", cart });
});

export default router;
