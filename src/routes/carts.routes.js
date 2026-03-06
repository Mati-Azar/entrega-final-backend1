import { Router } from "express";
import CartManager from "../dao/CartManager.js";

const router = Router();                                                                                     
const cartManager = new CartManager();

/* ===========================   RUTAS DE CARRITO   =========================== */

// Crea un nuevo carrito
router.post("/", async (req, res) => {
  const newCart = await cartManager.addCart();
  res.status(201).json(newCart);
});

// Agrega un producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
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
router.get("/:cid", async (req, res) => {
  const cid = Number(req.params.cid); // id del carrito
  const cart = await cartManager.getCartById(cid);
  // Si no existe el carrito
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.json(cart.products);
});

export default router;


