import { Router } from "express";
import messageModel from "../dao/models/messages.model.js";

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
    let { user, message } = req.body;
    if (!user || !message) {
        res.send({ status: "error", error: "Faltan completar datos" });
    }
    let result = await messageModel.create({ user, message });
    res.send({ result: "success", payload: result });
  
});

export default router;