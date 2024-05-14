import fs from "fs";

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.loadProducts();
    }

    loadProducts() {
        try {
            const data = fs.readFileSync(this.path, "utf8");
            this.products = JSON.parse(data);
        } catch (error) {
            this.products = [];
        }
    }

    saveProducts() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), "utf8");
        } catch (error) {
            console.error("Error al guardar los productos", error);
        }
    }

    getProducts() {
        return this.products;
    }

    addProduct(title, description, code, price, status = true, stock, category, thumbnail) {
        if(!title || !description || !code || !price || isNaN(stock) || !category) {
            console.log("Debes completar todos los campos");
            return;
        }

        const codeExists = this.products.find((product) => product.code === code);
        if (codeExists) {
            console.log("El campo no se puede repetir, vuelva a intentar con otro código identificador");
            return;
        }

        const product_id = this.products.length + 1;

        const product = {
            id: product_id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnail,
        }

        this.products.push(product);

        this.saveProducts();
    }

    getProductById(product_id) {
        const productFound = this.products.find((product) => product.id === product_id);
        if (!productFound) {
            console.log("Not Found!");
        }
        return productFound;
    }

    updateProduct(product_id, updatedProduct) {
        const productToUpdate = this.product.find(product => product.id === product_id);

        if (productToUpdate) {
            this.products = this.products.filter(product => product.id === product_id);

            this.products.push({ ...productToUpdate, ...updatedProduct});

            this.saveProducts();

            console.log(`El producto con el ID ${product_id}, fue actualizado correctamente`);
        }else {
            console.log(`No se ha encontrado ningún producto con el ID ${product_id}`);
        }
    }

    deleteProduct(product_id) {
        const productToDelete = this.products.find(product => product.id === product_id);

        if (productToDelete) {
            this.products = this.products.filter(product => product.id !== product_id);

            this.saveProducts();

            console.log(`El producto con el ID ${product_id} fue eliminado exitosamente!`);
        } else {
            console.log(`No se ha encontrado ningún producto con el ID ${product_id}`);
        }
    }
}

export { ProductManager };