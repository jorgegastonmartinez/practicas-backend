import { Router } from "express";
import productModel from "../dao/models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        let products = await productModel.find();
        res.send({ result: "success", payload: products });
    } catch (error) {
        console.error("Error al obtener los productos", error);
        res.status(500).json({ error: "Error al obtener los productos" });
    }
})

router.get("/:pid", async (req, res) => {
    try {
        let {pid} = req.params;

        let product = await productModel.findById(pid);

        if (!product) {
            return res.status(400).send({error: "Producto no encontrado"})
        }
        res.send({result: "success", payload: product})

    } catch (error) {
        console.error("Error al obtener el producto");
        res.status(500).json({ error: "Error al obtener el producto" });
    }
})

router.post("/", async (req, res) => {
    let {title, description, code, price, stock, category } = req.body;

    if(!title || !description || !code || !price || isNaN(stock) || !category){
        console.log("Debes completar todos los campos");
        return res.status(400).send({error: "Debes completar correctamente todos los campos"});
    }

    try {
        const codeExists = await productModel.exists({ code: code });

        if (codeExists) {
            console.log("El campo code ya existe con ese número");
            return res.status(400).send({error: "El campo code ya existe con ese número"})
        }

        let result = await productModel.create({
          title,
          description,
          code,
          price,
          stock,
          category,
        });

        res.send({result: "success", playload: result});

    } catch (error) {
        console.error("Error al crear el producto", error);
        res.status(500).send({error: "Error al crear el producto"})
    }
})

router.put("/:pid", async (req, res) => {
    let {pid} = req.params;

    let productToUpdate = req.body;

    if (!productToUpdate.title || !productToUpdate.description || !productToUpdate.code || !productToUpdate.price || isNaN(productToUpdate.stock) || !productToUpdate.category) {
        res.send({status: "Error", error: "Debe completar todos los campos del producto"})
    }

    try {
        const existProduct = await productModel.findById(pid);
        if (!existProduct) {
            return res.status(400).send({error: "Producto no encontrado"})
        }

        const codeExists = await productModel.exists({
          _id: { $ne: pid },
          code: productToUpdate.code,
        });

        if (codeExists) {
            return res.status(400).send({error: "El campo code ya está siendo utilizado por otro producto"})
        }

        let result = await productModel.updateOne({_id: pid}, productToUpdate);

        res.send({result: "success", payload: result});

    } catch (error) {
        console.error("Error al actualizar el producto", error);
        res.status(500).send({ error: "Error al actualizar el producto" });
    }
})

router.delete("/:pid", async (req, res) => {
    try {
        let {pid} = req.params;
    let result = await productModel.deleteOne({ _id: pid });
    res.send({result: "success", payload: result});
    } catch (error) {
        console.error("El producto no se ha podido eliminar");
        res.status(500).send({error: "El producto no se ha podido eliminar"})
    }
});

export default router;