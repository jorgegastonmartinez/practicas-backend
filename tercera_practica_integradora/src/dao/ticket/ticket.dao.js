import ticketModel from "../../models/ticket.model.js"

export default class Ticket {

    getTickets = async () => {
        try {
            let result = await ticketModel.find();
            return result;
        } catch (error) {
            console.error('Error al obtener los tickets:', error);
            return null;
        }
    }

    getTicketById = async (id) => {
        try {
            let result = await ticketModel.findOne({ _id : id })
            return result
        } catch (error) {
            console.log(error);
            return null
        }
    }

    createTicket = async (ticket) => {
        try {
            let result = await ticketModel.create(ticket);
            return result
        } catch (error) {
            console.log(error);
            return null
        }
    }

    resolveTicket = async (id, ticket) => {
        try {
            let result = await ticketModel.updateOne({ _id: id }, { $set: ticket})
            return result
        } catch (error) {
            console.log(error);
            return null
        }
    }
}