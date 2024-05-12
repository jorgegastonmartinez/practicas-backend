import { Router } from "express";
import messageModel from "../models/messages.model.js";


const router = Router();

router.get("/", async (req, res) => {
    try {
        let messages = await messageModel.find();
        res.send({ result: "success", payload: messages });
    } catch (error) {
        console.log("Error al obtener los mensajes", error);
    }
    
})

export default router;