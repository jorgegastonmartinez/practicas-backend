import { Router } from "express";
import cartModel from "../dao/models/cart.model.js";
import productModel from "../dao/models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        let carts = await cartModel.find();
        res.send({ result: "success", payload: carts });
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
})

// router.get("/:cid", async (req, res) => {
//     try {
//         let {cid} = req.params;
//         let cart = await cartModel.findById(cid);
        
//         if (!cart) {
//             return res.status(400).send({error: "Carrito no encontrado"})
//         }
//         res.send({ result: "success", payload: cart });
//     } catch (error) {
//         console.error("Error al obtener el carrito");
//         res.status(500).json({ error: "Error al obtener el carrito" });
//     }
// })

router.get("/:cid", async (req, res) => {
    try {
        let {cid} = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "ID de carrito no válido" });
        }

        let cart = await cartModel.findById(cid);
        
        if (!cart) {
            return res.status(400).send({error: "Carrito no encontrado"})
        }

        let products = [];

        for (const item of cart.products) {
            const product = await productModel.findById(item.product);
            if (product) {
                products.push({
                  product: product,
                  quantity: item.quantity,
                });
            }
        }
        const cartWithProducts = {
          ...cart.toObject(),
          products,
        };
        res.send({ result: "success", payload: cartWithProducts });

    } catch (error) {
        console.error("Error al obtener los productos del carrito", error);
        res.status(500).json({ error: "Ocurrió un error al obtener los productos del carrito" });
    }
});



export default router;