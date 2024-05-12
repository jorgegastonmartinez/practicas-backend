import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        let products = await productModel.find();
        res.send({ result: "success", payload: products });
    } catch (error) {
        console.log(error);
    }
})

// router.post("/", async (req, res) => {
//     let {} = req.body;
//     if(){

//     }
//     let result = await productModel.create({});
//     res.send({result: "success", playload: result});
// })

// router.put("/:pid", async (req, res) => {
//     let {pid} = req.params;

//     let productToReplace = req.body;

//     if() {
//         res.send({status: "Error", error: "Debe completar todos los campos del producto"})
//     }
//     let result = await userModel.updateOne({_id: pid}, productToReplace);

//     res.send({result: "success", payload: result});
// })

router.delete("/:pid", async (req, res) => {
    let {pid} = req.params;
    let result = await productModel({ _id: pid });
    res.send({result: "success", payload: result});
});

export default router;