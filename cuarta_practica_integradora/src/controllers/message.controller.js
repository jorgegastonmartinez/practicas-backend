import messageModel from '../models/message.model.js';

export const createMessage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).send({ status: 'error', error: 'El mensaje no puede estar vacío' });
        }

        const newMessage = await messageModel.create({ user: userId, message });
            res.status(201).send({ status: 'success', payload: newMessage });
    } catch (error) {
        console.error('Error al crear un mensaje:', error);
        res.status(500).send({ status: 'error', error: 'Error al crear un mensaje' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await messageModel.find().populate('user').lean();
            res.send({ result: 'success', payload: messages });
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).send({ status: 'error', error: 'Error al obtener los mensajes' });
    }
};