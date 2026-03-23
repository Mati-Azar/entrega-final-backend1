import { Router } from "express";
import { productModel } from "../model/productModel.js";

const router = Router();

router.get("/home", async (req, res) => {
  // const products = await productModel.find({}).lean();
  const { page = 1 } = req.query;
  const pagination = await productModel.paginate(
    {},
    {
      limit: 4,
      page: page,
      sort: { price: 1 },
      lean: true,
    },
  );
  res.render("home", {
    pagination,
    styles: {
      main: "/css/main.css",
      home: "/css/home.css",
    },
  });
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

export default router;
