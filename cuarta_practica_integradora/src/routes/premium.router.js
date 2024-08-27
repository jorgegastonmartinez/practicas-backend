import { Router } from "express";
import { isAuthenticated, isPremium } from "../middleware/auth.js";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

const router = Router();

router.get("/premium/products", isAuthenticated, isPremium, getProducts);
router.post("/premium/products", isAuthenticated, isPremium, createProduct);
router.put("/premium/products/:pid", isAuthenticated, isPremium, updateProduct);
router.delete("/premium/products/:pid", isAuthenticated, isPremium, deleteProduct);

export default router;