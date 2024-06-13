import { Router } from "express";
import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productsModel from "../models/product.model.js";
import {isAuthenticated} from "../middleware/auth.js";

const router = Router();

router.post("/carts", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;

        if (!userId) {
            return res.status(400).json({ error: "El ID del usuario no está definido en la sesión" });
        }

        let existingCart = await cartModel.findOne({ user: userId });

        if (existingCart) {
            return res.json({message: "Ya existe un carrito para este usuario", cart: existingCart });
        }
        const newCart = new cartModel({
            user: userId,
            products: [],
        })

        await newCart.save();

        res.json({ message: "Carrito creado correctamente", cart: newCart})
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            res.status(500).json({ error: "Ocurrió un error al crear el carrito"})
        }
});

router.get("/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "ID de carrito no válido" });
        }
        const cart = await cartModel.findById(cid).populate('products.product').lean();
        
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        res.status(200).json({ message: 'Carrito encontrado', cart });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al obtener el carrito" });
    }
});

router.post("/carts/:cid/products/:pid", async (req, res) => {
    try {
        let { cid, pid } = req.params;
        let { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            console.error("ID de carrito o producto no válido");
            return res.status(400).json({ error: "ID de carrito o producto no válido" });
        }

        let cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            console.error("Carrito no encontrado");
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        let product = await productsModel.findById(pid);
        console.log(product);
        if (!product) {
            console.error("Producto no encontrado");
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const existsProductIndex = cart.products.findIndex(item => item.product._id.toString() === pid);

        if (existsProductIndex !== -1) {
            cart.products[existsProductIndex].quantity += (quantity || 1);
        } else {
            cart.products.push({ product: pid, quantity: quantity || 1 });
        }
    
        cart.products.forEach(item => {
            console.log(`Producto: ${item.product.title}, Precio: ${item.product.price}, Cantidad: ${item.quantity}`);
        });
        
        cart.total = cart.products.reduce((acc, item) => {
            let price = item.product.price || 0;
            console.log(item.product.price);
            return acc + (item.quantity * price);
        }, 0);
        
        await cart.save();
        return res.status(200).json({ message: 'Producto agregado al carrito', cart });
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Ocurrió un error al agregar producto al carrito" });
    }
});

router.delete("/carts/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "ID carrito o producto no válido" });
        }
        let cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({ error: "Producto no encontrado en el carrito" });
        }
        cart.products.splice(productIndex, 1);
        
        const productIds = cart.products.map(item => item.product);
        const products = await productsModel.find({ _id: { $in: productIds } });
        cart.total = cart.products.reduce((acc, item) => {
            const product = products.find(p => p._id.toString() === item.product.toString());
            return acc + (product.price * item.quantity);
        }, 0);

        await cart.save();
        res.status(200).json({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al eliminar producto del carrito" });
    }
});

router.put("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    try {
        let cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'El cuerpo de la solicitud debe contener un arreglo de productos' });
        }
        cart.products = products;
        cart.total = products.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
        await cart.save();
        return res.status(200).json({ message: 'Carrito actualizado correctamente', cart });
    } catch (error) {
        console.error('Error al actualizar el carrito:', error.message);
        return res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
})

router.put("/carts/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        let cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        const productIndex = cart.products.findIndex(p => p.product._id.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }
        if (quantity <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor que 0' });
        }
        cart.products[productIndex].quantity = quantity;
        cart.total = cart.products.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

        await cart.save();
        return res.status(200).json({ message: 'Cantidad de producto actualizada en el carrito', cart });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', error.message);
        return res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' });
    }
})

router.delete("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    try {

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "ID de carrito no válido" });
        }

        let cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        console.log(cart);
        cart.products = [];
        cart.total = 0;
        await cart.save();
        return res.status(200).json({ message: 'Todos los productos han sido eliminados del carrito', cart });
    } catch (error) {
        console.error('Error al eliminar los productos del carrito:', error.message);
        return res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
    }
})

export default router;