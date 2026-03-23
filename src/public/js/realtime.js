/* ==== CONEXIÓN AL SERVIDOR WEBSOCKET  ====== */
const socket = io();

/* ==== CONTENEDOR PARA LA LISTA DE PRODUCTOS  ====== */
const productsList = document.getElementById("productsList");

/* ==== RECIBIR LISTA ACTUAL DE PRODUCTOS Y RENDERIZAR  ====== */
socket.on("productosActuales", (products) => {
  productsList.innerHTML = ""; /* ==== LIMPIAR LISTA  ====== */

  products.forEach((product) => {
    const li = document.createElement("li");

    /* ==== RENDERIZAR PRODUCTO COMO TARJETA  ====== */
    li.innerHTML = `
      <div class="product-info">
        <div class="product-title-desc">
          <strong>${product.title}</strong> - <span>${product.description}</span>
        </div>
        <div class="product-price">
          <span class="price">$${product.price}</span>
        </div>
        <div class="product-details">
  <span>ID: ${product._id} | Código: ${product.code} | Stock: ${product.stock} | Categoría: ${product.category} | 
    Estado: 
    <span style="color: ${product.status ? "green" : "red"};">
      ${product.status ? "Disponible" : "No disponible"}
    </span>
  </span>
</div>
      </div>
    `;
    productsList.appendChild(li);
  });
});

/* ==== FORMULARIO PARA AGREGAR PRODUCTO  ====== */
const addProductForm = document.getElementById("addProductForm");

addProductForm.addEventListener("submit", (e) => {
  e.preventDefault(); /* ==== EVITAR RECARGA DE PÁGINA  ====== */

  /* ==== LEER DATOS DEL FORMULARIO  ====== */
  const formData = new FormData(addProductForm);
  const productData = Object.fromEntries(formData.entries());

  /* ==== CONVERTIR CAMPOS NUMÉRICOS Y BOOLEANOS  ====== */
  productData.price = Number(productData.price);
  productData.stock = Number(productData.stock);
  productData.status = productData.status === "true";
  productData.thumbnails = productData.thumbnails
    ? [productData.thumbnails]
    : [];

  /* ==== ENVIAR DATOS AL SERVIDOR POR WEBSOCKET  ====== */
  socket.emit("nuevoProducto", productData);

  /* ==== MOSTRAR NOTIFICACIÓN DE ÉXITO  ====== */
  Swal.fire({
    icon: "success",
    title: "Producto agregado",
    text: `${productData.title} se agregó correctamente!`,
    timer: 1500,
    showConfirmButton: false,
  });

  /* ==== LIMPIAR FORMULARIO  ====== */
  addProductForm.reset();
});

/* ==== FORMULARIO PARA ELIMINAR PRODUCTO  ====== */
const deleteProductForm = document.getElementById("deleteProductForm");

deleteProductForm.addEventListener("submit", (e) => {
  e.preventDefault(); /* ==== EVITAR RECARGA DE PÁGINA  ====== */

  /* ==== LEER ID DEL PRODUCTO A ELIMINAR  ====== */
  const pid = deleteProductForm.pid.value;

  /* ==== ENVIAR ID AL SERVIDOR POR WEBSOCKET  ====== */
  socket.emit("eliminarProducto", pid);

  /* ==== NOTIFICACIÓN DE ÉXITO  ====== */
  Swal.fire({
    icon: "success",
    title: "Producto eliminado",
    text: `El producto con ID ${pid} se eliminó correctamente!`,
    timer: 1500,
    showConfirmButton: false,
  });

  /* ==== LIMPIAR FORMULARIO  ====== */
  deleteProductForm.reset();
});
