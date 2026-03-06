import { Router } from "express";
import ProductManager from "../dao/ProductManager.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", {
    products,
    styles: {
      main: "/css/main.css",
      products: "/css/home.css",
    },
  });
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

export default router;
