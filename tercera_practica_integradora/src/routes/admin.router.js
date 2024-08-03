import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

import { deleteMessage } from "../controllers/views.controller.js";

const router = Router();

router.get("/admin/products", isAuthenticated, isAdmin, getProducts);
router.post("/admin/products", isAuthenticated, isAdmin, createProduct);
router.put("/admin/products/:pid", isAuthenticated, isAdmin, updateProduct);
router.delete("/admin/products/:pid", isAuthenticated, isAdmin, deleteProduct);
router.delete('/admin/messages/:mid', isAuthenticated, isAdmin, deleteMessage);

export default router;