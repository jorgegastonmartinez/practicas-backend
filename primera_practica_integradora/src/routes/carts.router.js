import { Router } from "express";
import cartModel from "../dao/models/cart.model.js";
import productModel from "../dao/models/product.model.js";

const router = Router();

router.post("/api/carts", async (req, res) => {
    try {
        const newCart = new cartModel({
          products: [],
        });

        await newCart.save();

        res.json({ message: "Carrito creado correctamente", cart: newCart });
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).json({ error: "Ocurrió un error al crear el carrito" });
    }
});

router.get("/:cid", async (req, res) => {
    try {
        let { cid } = req.params;

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

router.post("/:cid/product/:pid", async (req, res) => {
    try {
        let { cid } = req.params;
        let { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "ID carrito o producto no válido" });
        }

        let cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        let product = await productModel.findById(pid);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const existsProductIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (existsProductIndex !== -1) {
            cart.products[existsProductIndex].quantity++;
        } else {
            const productToAdd = {
                product: mongoose.Types.ObjectId(pid),
                quantity: 1
            };
            cart.products.push(productToAdd);
        }

        await cart.save();

        res.json({ message: "Producto añadido al carrito correctamente", cart });
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Ocurrió un error al agregar producto al carrito" });
    }
});

export default router;