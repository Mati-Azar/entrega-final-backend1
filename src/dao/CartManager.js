import fs from "fs/promises";

class CartManager {
  // Verifica si el archivo carts.json existe, si no existe, lo crea con un array vacío.
  async existsFile() {
    try {
      await fs.readFile("carts.json", "utf-8");
    } catch (error) {
      await fs.writeFile("carts.json", JSON.stringify([]), "utf-8");
    }
  }

  // Obtiene todos los carritos desde el archivo carts.json
  async getCarts() {
    await this.existsFile(); // Asegura que el archivo exista
    const carts = await fs.readFile("carts.json", "utf-8");
    return JSON.parse(carts); // Convierte el texto en array
  }

  // Obtiene un carrito específico por su id
  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((cart) => cart.id === id) || null;
  }

  // Crea un nuevo carrito con id autogenerado y products vacío
  async addCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length === 0 ? 1 : carts[carts.length - 1].id + 1,
      products: [],
    };
    carts.push(newCart);
    await fs.writeFile("carts.json", JSON.stringify(carts), "utf-8");
    return newCart;
  }

  // Agrega un producto a un carrito, si el producto ya existe, incrementa la cantidad
  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex((cart) => cart.id === cid);
    // Si no existe el carrito
    if (cartIndex === -1) {
      return null;
    }
    // Obtiene el carrito seleccionado
    const cart = carts[cartIndex];
    // Busca si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(
      (item) => item.product === pid,
    );
    if (productIndex === -1) {
      // Si el producto no existe, se agrega con quantity 1
      cart.products.push({
        product: pid,
        quantity: 1,
      });
    } else {
      // Si el producto ya existe, incrementa la cantidad
      cart.products[productIndex].quantity++;
    }
    await fs.writeFile("carts.json", JSON.stringify(carts), "utf-8");
    return cart;
  }
}

export default CartManager;
