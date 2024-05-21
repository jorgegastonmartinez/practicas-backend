import { Router } from "express";
import cartModel from "../models/cart.model.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        let carritos = await cartModel.find();
        
    } catch (error) {
        
    }
})

export default router;