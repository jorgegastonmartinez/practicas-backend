import Ticket from '../dao/ticket/ticket.dao.js'
import Cart from "../dao/cart/cart.dao.js"
import cartsModel from '../models/cart.model.js';
import UserDTO from "../dto/user.dto.js";

const ticketsService = new Ticket()
const cartService = new Cart()

export const getTickets = async (req, res) => {
    try {
        let result = await ticketsService.getTickets()
        res.send({ status: "success", result })
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message })
    }
}

export const getTicketById = async (req, res) => {
    const { tid } = req.params
    try {
        let ticket = await ticketsService.getTicketById(tid)
        res.send({ status: "success", result: ticket })
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message })
    }
}

export const createTicket = async (req, res) => {
    const { cid } = req.params;
    const userEmail = req.session.user.email; 

    try {
        const cart = await cartService.findById(cid).lean();
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const ticket = await ticketsService.createTicket({
            purchase_datetime,
            amount: cart.total,
            purchaser: userEmail,  
            cartId: cid           
        });

        await Cart.findByIdAndUpdate(cid, { products: [], total: 0 });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message })
    }
}

export const renderTicket = async (req, res) => {
    const { tid } = req.params;
    const { cid } = req.params;

    try {
        const ticket = await ticketsService.getTicketById(tid);
        if (!ticket) {
            return res.status(404).render('error', { message: 'Ticket no encontrado' });
        }

        const cart = await cartsModel.findById(cid).populate('products.product').populate('user').lean();

        console.log('Ticket:', ticket);
        console.log('Cart:', cart);

        const userDTO = new UserDTO(req.session.user);

        const ticketData = {
            id: ticket._id.toString(),
            amount: ticket.amount,
            purchaser: userDTO, 
            cartId: ticket.cartId.toString(),
            code: ticket.code,
            purchase_datetime: ticket.purchase_datetime,
        };

        res.render('ticket', { ticket: ticketData });

    } catch (error) {
        console.error('Error al obtener el ticket:', error);
        res.status(500).render('error', { message: 'Error interno del servidor' });
    }
};