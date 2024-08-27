import cartModel from "../../models/cart.model.js";
import productsModel from "../../models/product.model.js";
import mongoose from "mongoose";

export default class CartDAO {
    async createCartForUser(userId) {
        try {
            let existingCart = await cartModel.findOne({ user: userId }).populate('products.product').populate('user').lean();
            if (existingCart) {
                return { message: "Ya existe un carrito para este usuario", cart: existingCart };
            }
            const newCart = new cartModel({
                user: userId,
                products: [],
            });

            await newCart.save();
            return { message: "Carrito creado correctamente", cart: newCart };
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            throw new Error("Ocurrió un error al crear el carrito");
        }
    }

    async getCartById(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                return res.status(400).json({ error: "ID de carrito no válido" });
            }
            const cart = await cartModel.findById(cartId).populate('products.product').populate('user').lean();

            return { message: 'Carrito encontrado', cart };
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            throw new Error("Ocurrió un error al obtener el carrito");
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("ID de carrito o producto no válido");
            }
            let cart = await cartModel.findById(cartId).populate('products.product').populate('user');

            if (!cart) {
                console.error("Carrito no encontrado");
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
            let product = await productsModel.findById(productId);

            if (!product) {
                console.error("Producto no encontrado");
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            const existsProductIndex = cart.products.findIndex(item => item.product._id.toString() === productId);

            if (existsProductIndex !== -1) {
                cart.products[existsProductIndex].quantity += (quantity || 1);
            } else {
                cart.products.push({ product: productId, quantity: quantity || 1 });
            }
            cart = await cart.populate('products.product');

            cart.products.forEach(item => {
                console.log(`Producto: ${item.product.title}, Precio: ${item.product.price}, Cantidad: ${item.quantity}`);
            });

            cart.total = cart.products.reduce(
              (acc, item) => acc + item.quantity * item.product.price,
              0
            );
            await cart.save();

            return { message: 'Producto agregado al carrito', cart };
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            throw new Error("Ocurrió un error al agregar producto al carrito");
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("ID de carrito o producto no válido");
            }

            let cart = await cartModel.findById(cartId).populate('products.product').populate('user');

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            const productIndex = cart.products.findIndex(item => item.product._id.toString() === productId);

            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            }
            cart.products.splice(productIndex, 1);

            if (cart.products.length === 0) {
                cart.total = 0;
            } else {
                const productIds = cart.products.map(item => item.product._id);

                const products = await productsModel.find({ _id: { $in: productIds } }).lean();

                cart.total = cart.products.reduce((acc, item) => {
                    const product = products.find(p => p._id.toString() === item.product._id.toString());
                    return acc + (item.quantity * (product ? product.price : 0));
                }, 0);
            }
            await cart.save();

            return { message: "Producto eliminado del carrito", cart };
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            throw new Error("Ocurrió un error al eliminar producto del carrito");
        }
    }

    async updateCart(cartId, products) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error("ID de carrito no válido");
            }
            let cart = await cartModel.findById(cartId).populate('products.product').populate('user');

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            if (!Array.isArray(products)) {
                throw new Error("El cuerpo de la solicitud debe contener un arreglo de productos");
            }

            const productIds = products.map(item => item.product);

            const productsInDB = await productsModel.find({ _id: { $in: productIds } }).lean();

            cart.products = products.map(item => {
                const product = productsInDB.find(p => p._id.toString() === item.product.toString());
                return {
                    product: item.product,
                    quantity: item.quantity,
                    price: product ? product.price : 0
                };
            })
            cart.total = cart.products.reduce((acc, item) => acc + item.quantity * item.price, 0);

            await cart.save();

            return { message: "Carrito actualizado correctamente", cart };
        } catch (error) {
            console.error("Error al actualizar el carrito:", error);
            throw new Error("Error al actualizar el carrito");
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("ID de carrito o producto no válido");
            }
            let cart = await cartModel.findById(cartId).populate('products.product').populate('user');

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);

            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            }

            if (quantity <= 0) {
                throw new Error("La cantidad debe ser mayor que 0");
            }

            cart.products[productIndex].quantity = quantity;

            cart.total = cart.products.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

            await cart.save();

            return { message: "Cantidad de producto actualizada en el carrito", cart };
        } catch (error) {
            console.error("Error al actualizar la cantidad del producto en el carrito:", error);
            throw new Error("Error al actualizar la cantidad del producto en el carrito");
        }
    }

    async clearCart(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error("ID de carrito no válido");
            }
            let cart = await cartModel.findById(cartId).populate('products.product').populate('user');

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            cart.products = [];
            cart.total = 0;

            await cart.save();

            return { message: 'Todos los productos han sido eliminados del carrito', cart };
        } catch (error) {
            console.error('Error al eliminar los productos del carrito:', error.message);
            throw new Error('Error al eliminar los productos del carrito');
        }
    }

    async getCartByUserId(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error("ID de usuario no válido");
            }
            const cart = await cartModel.findOne({ user: userId }).populate('products.product').populate('user').lean();

            return { message: 'Carrito encontrado', cart };
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            throw new Error("Ocurrió un error al obtener el carrito");
        }
    }
}