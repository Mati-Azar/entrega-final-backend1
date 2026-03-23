import { Router } from "express";
import { productModel } from "../model/productModel.js";

const router = Router();

/* ===========================   RUTAS DE PRODUCTOS   =========================== */

// Devuelve reporte de reposicion de stock y me lo guarda en la DB
router.get("/stock", async (req, res) => {
  const stock = await productModel.aggregate([
    {
      $match: {
        stock: { $lt: 10 },
      },
    },
    {
      $project: {
        title: "$title",
        stock: "$stock",
        category: "$category",
      },
    },
    {
      $group: {
        _id: "$category",
        products: {
          $push: {
            title: "$title",
            stock: "$stock",
          },
        },
      },
    },
    {
      $merge: {
        into: "stock_reports",
      },
    },
  ]);
  res.status(200).json(stock);
});

// Devuelve todos los productos
router.get("/", async (req, res) => {
  // Leer query params
  const { limit = 4, page = 1, sort, query } = req.query;
  // Convertir a numeros
  const limitNum = Number(limit);
  const pageNum = Number(page);
  // Configuracion de ordenamiento
  let sortOption = {};
  if (sort === "asc") {
    sortOption = { price: 1 };
  } else if (sort === "desc") {
    sortOption = { price: -1 };
  }
  // Filtro Dinámico
  let filter = {};
  if (query) {
    filter = { category: query };
  }
  // Paginate de moongose
  const result = await productModel.paginate(filter, {
    limit: limitNum,
    page: pageNum,
    sort: sortOption,
    lean: true,
  });
  //Respuesta
  res.status(200).json({
    status: "success",
    payload: result.docs,
    totalPages: result.totalPages,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink: result.hasPrevPage
      ? `http://localhost:8080/api/products?page=${result.prevPage}&limit=${limitNum}`
      : null,
    nextLink: result.hasNextPage
      ? `http://localhost:8080/api/products?page=${result.nextPage}&limit=${limitNum}`
      : null,
  });
});


// Devuelve un producto específico según el id recibido por parámetro
router.get("/:pid", async (req, res) => {
  const pid = req.params.pid;
  const product = await productModel.findById(pid);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
});

// Crea un nuevo producto
router.post("/", async (req, res) => {
  try {
    const product = req.body;
    const newProduct = await productModel.create(product);
    // Importación dinámica de socketServer para emitir eventos en tiempo real.
    const { socketServer } = await import("../app.js");
    const updatedProducts = await productModel.find({});
    // Envía a todos los clientes la lista actualizada de productos en tiempo real
    // Actualiza la vista sin recargar
    socketServer.emit("productosActuales", updatedProducts);
    res.status(200).json({
      message: "producto agregado",
      newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar producto" });
  }
});

// Actualiza un producto por su id
router.put("/:pid", async (req, res) => {
  const pid = req.params.pid; // id que viene por la URL
  const updatedFields = req.body; // campos a actualizar (body)
  const updatedProduct = await productModel.findByIdAndUpdate(
    pid,
    updatedFields,
  );
  // Si no existe el producto
  if (!updatedProduct) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(updatedProduct);
});

// Elimina un producto por su id
router.delete("/:pid", async (req, res) => {
  const pid = req.params.pid;
  const deletedProduct = await productModel.findByIdAndDelete(pid);
  if (!deletedProduct) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(deletedProduct);
});
export default router;
