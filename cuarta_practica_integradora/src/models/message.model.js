import mongoose from 'mongoose';

const messageCollection = "messages";

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    message: { type: String, required: true },
}, {
    timestamps: true, 
}); 

const messageModel = mongoose.model(messageCollection, messageSchema);

export default messageModel;