import { Router } from "express";
import { isAuthenticated, isUser } from "../middleware/auth.js";
import {
    createCart,
    getCart,
    addProductToCart,
    removeProductFromCart,
    updateCart,
    updateProductQuantity,
    clearCart,
    purchaseCart
} from "../controllers/cart.controller.js";

const router = Router();

router.post("/carts", isAuthenticated, createCart);
router.get("/carts/:cid", getCart);
router.post("/carts/:cid/products/:pid", isUser, addProductToCart);
router.delete("/carts/:cid/products/:pid", removeProductFromCart);
router.put("/carts/:cid", updateCart);
router.put("/carts/:cid/products/:pid", updateProductQuantity);
router.delete("/carts/:cid", clearCart);

router.post("/carts/:cid/purchase", purchaseCart)

export default router;