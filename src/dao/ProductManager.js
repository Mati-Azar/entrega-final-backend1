import fs from "fs/promises";

class ProductManager {
  // Verifica si el archivo products.json existe, sino existe lo crea
  async existsFile() {
    try {
      await fs.readFile("products.json", "utf-8");
    } catch (error) {
      await fs.writeFile("products.json", JSON.stringify([]), "utf-8");
    }
  }

  // Obtiene todos los productos desde el archivo products.json
  async getProducts() {
    await this.existsFile();
    const products = await fs.readFile("products.json", "utf-8");
    return JSON.parse(products);
  }

  // Obtiene un producto específico por su id
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((product) => product.id === id) || null;
  }

  // Agrega un nuevo producto al archivo products.json, el id se genera automáticamente y no se recibe desde el body
  async addProduct(product) {
    const products = await this.getProducts();
    // Si no hay productos, el id arranca en 1,s i hay productos, toma el último id y le suma 1
    const newProduct = {
      id: products.length === 0 ? 1 : products[products.length - 1].id + 1,
      ...product,
    };
    products.push(newProduct);
    await fs.writeFile("products.json", JSON.stringify(products), "utf-8");
    return newProduct;
  }

  // Actualiza un producto existente por su id, no permite modificar el id
  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    // Busca el índice del producto a actualizar, si no existe el producto, devuelve null
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return null;
    }
    // Actualiza el producto manteniendo el id original
    products[index] = {
      ...products[index],
      ...updatedFields,
      id: products[index].id,
    };
    await fs.writeFile("products.json", JSON.stringify(products), "utf-8");
    return products[index];
  }

  // Elimina un producto existente por su id
  async deleteProduct(id) {
    const products = await this.getProducts();
    // Busca el índice del producto a eliminar
    const index = products.findIndex((product) => product.id === id);
    // Si no existe el producto, devuelve null
    if (index === -1) {
      return null;
    }
    // Elimina el producto del array y lo guarda
    const deletedProduct = products.splice(index, 1)[0];
    await fs.writeFile("products.json", JSON.stringify(products), "utf-8");
    return deletedProduct;
  }
}

export default ProductManager;
