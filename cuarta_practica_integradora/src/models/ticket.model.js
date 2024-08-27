import mongoose from "mongoose";
import crypto from "crypto";

const collection = "Ticket"

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(8).toString('hex')
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true  
    },
    purchaser: { 
        type: String,
        required: true },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts',
        required: true
    }
}, {
    timestamps: true  
});

const ticketModel = mongoose.model(collection, ticketSchema)

export default ticketModel;