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

router.post("/", async (req, res) => {
    let { socketId, message } = req.body;
    if (!socketId || !message) {
        res.send({ status: "error", error: "Faltan completar datos" });
    }
    let result = await messageModel.create({ socketId, message });
    res.send({ result: "success", payload: result });
  
});

export default router;