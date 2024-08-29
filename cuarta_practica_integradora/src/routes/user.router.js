import { Router } from "express";
import { upload } from "../utils.js";
import { isAuthenticated, isPremium } from "../middleware/auth.js";
import {
  getUsers,
  getUserById,
  saveUser,
  uploadDocuments,
  updateLastConnection,
  updateUser,
  upgradeToPremium
} from "../controllers/user.controller.js";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getUsers);
router.get("/:uid", getUserById)
router.post("/", saveUser)
router.put('/:uid', updateUser);

router.get("/premium/products", isAuthenticated, isPremium, getProducts);
router.post("/premium/products", isAuthenticated, isPremium, createProduct);
router.put("/premium/products/:pid", isAuthenticated, isPremium, updateProduct);
router.delete("/premium/products/:pid", isAuthenticated, isPremium, deleteProduct);

router.post('/:uid/documents', upload.array('documents'), uploadDocuments);
router.put('/:uid/last-connection', updateLastConnection);
router.put('/premium/:uid', upgradeToPremium);

export default router;