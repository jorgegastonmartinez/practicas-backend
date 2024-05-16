import express from "express";
import messageModel from "../models/messages.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mensajes = await messageModel.find().lean();
    res.render("chat", {mensajes});
  } catch (error) {
    console.log("error al mostrar los mensajes", error);
  }
  
});

export default router;