import mongoose from "mongoose";
import CartDAO from '../dao/cart/cart.dao.js';
import TicketDAO from "../dao/ticket/ticket.dao.js";
import cartsModel from "../models/cart.model.js";
import productsModel from "../models/product.model.js";
import usersModel from "../models/user.model.js";
import { sendTicketEmail } from "../controllers/nodemailer.controller.js"

const cartService = new CartDAO();
const ticketService = new TicketDAO();

export const createCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        if (!userId) {
            return res.status(400).json({ error: "El ID del usuario no está definido en la sesión" });
        }
        const { message, cart } = await cartService.createCartForUser(userId);

        if (message === "Ya existe un carrito para este usuario") { 
            return res.json({ message, cart });
        }

        res.json({ message, cart });
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al crear el carrito" });
    }
};

export const getCart = async (req, res) => {
    try {
        const { cid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "ID de carrito no válido" });
        }
        
        const { message, cart } = await cartService.getCartById(cid);
        
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        res.render('carts', { cart }); 

    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al obtener el carrito" });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "ID de carrito o producto no válido" });
        }
        const { message, cart } = await cartService.addProductToCart(cid, pid, quantity);

        res.status(200).json({ message, cart });
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al agregar producto al carrito" });
    }
};

export const removeProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "ID de carrito o producto no válido" });
        }
        const { message, cart } = await cartService.removeProductFromCart(cid, pid);

        res.status(200).json({ message, cart });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al eliminar producto del carrito" });
    }
};

export const updateCart = async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    try {
        const { message, cart } = await cartService.updateCart(cid, products);
        return res.status(200).json({ message, cart });
    } catch (error) {
        console.error("Error al actualizar el carrito:", error.message);
        return res.status(500).json({ error: "Error al actualizar el carrito" });
    }
};

export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const { message, cart } = await cartService.updateProductQuantity(cid, pid, quantity);
        return res.status(200).json({ message, cart });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', error.message);
        return res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' });
    }
};

export const clearCart = async (req, res) => {
    const { cid } = req.params;
    try {
        const { message, cart } = await cartService.clearCart(cid);
        return res.status(200).json({ message, cart });
    } catch (error) {
        console.error('Error al eliminar los productos del carrito:', error.message);
        return res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
    }
};

export const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const { userId, userEmail } = req.body;  

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error('ID de carrito o usuario no válido');
            return res.status(400).json({ error: 'ID de carrito o usuario no válido' });
        }

        if (!userId || !userEmail) {
            return res.status(400).json({ error: 'userId y userEmail son necesarios en el cuerpo de la solicitud' });
        }

        const cart = await cartsModel.findById(cid).populate('products.product').populate('user').lean();
        if (!cart) {
            console.error('Carrito no encontrado');
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        if (cart.products.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const user = await usersModel.findById(userId);
        if (!user) {
            console.error('Usuario no encontrado');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const totalAmount = cart.products.reduce((total, item) => {
            if (!item.product || typeof item.product.price !== 'number' || typeof item.quantity !== 'number') {
                throw new Error('Datos de carrito inválidos');
            }
            return total + (item.product.price * item.quantity);
        }, 0);

        const ticket = await ticketService.createTicket({
            amount: totalAmount,
            purchase_datetime: new Date(),
            purchaser: user.email,  
            cartId: cart._id                 
        });

        for (const item of cart.products) {
            await productsModel.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
        }

        await cartsModel.findByIdAndUpdate(cid, { products: [], total: 0 });

        await usersModel.findByIdAndUpdate(userId, { cart: null });

        const productDetails = cart.products.map(product => 
            `Producto: ${product.product.title}\nCantidad: ${product.quantity}\nPrecio: $ ${product.product.price}\n`
        ).join('\n');

        await sendTicketEmail(ticket, user, productDetails);

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error al finalizar la compra del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};