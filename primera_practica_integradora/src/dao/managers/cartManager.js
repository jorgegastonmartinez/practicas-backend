import fs from "fs";

class CartsManager {
    constructor(path, productManager) {
        this.path = path;
        this.productManager = productManager;
        this.carritos = [];
        this.loadCarts();
    }

    loadCarts() {
        try {
            const data = fs.readFileSync(this.path, "utf8");
            this.carritos = JSON.parse(data);
        } catch (error) {
            this.carritos = [];
        }
    }

    saveCarts() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.carritos, null, 2), "utf8");
        } catch (error) {
            console.error("Error al guardar los carritos", error);
        }
    }

    getCarts() {
        return this.carritos;
    }

    createCart() {

        const cart_id = this.carritos.length + 1;
        const newCart = {
            id: cart_id,
            products: []
        };

        this.carritos.push(newCart);
        this.saveCarts();
        return newCart;
    }

    getCartById(cart_id) {
        const cartFound = this.carritos.find((cart) => cart.id === cart_id);
        if(!cartFound) {
            console.log("Not Found");
        }
        return cartFound;
    }
    
    addProductToCart(cartId, productId) {
        const cart = this.getCartById(cartId);
        if (!cart) {
            console.error("No se encontró el carrito con el ID especificado");
            return;
        }

        const product = this.productManager.getProductById(productId); 
        if (!product) {
            console.error("No se encontró el producto con el ID especificado");
            return;
        }

        cart.products.push(product);
        this.saveCarts();
    }
}

export { CartsManager };