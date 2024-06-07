import { Router } from "express";
import { isAuthenticated, isNotAuthenticated } from "../middleware/auth.js";

import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

const router = Router();

router.get("/", async (req, res) => {
  res.render("login", {})
});

router.get("/products", isAuthenticated, async (req, res) => {
    let page = parseInt(req.query.page);
    if (!page) page = 1;

    let result = await productModel.paginate(
      {},
      { page, limit: 10, lean: true }
    )
    result.prevLink = result.hasPrevPage ? `http://localhost:8080/products?page=${result.prevPage}`:'';
    result.nextLink = result.hasNextPage ? `http://localhost:8080/products?page=${result.nextPage}`:'';
    result.isValid = !(page <= 0 || page > result.totalPages);

    const user = req.session.user;

    res.render("products", { ...result, user });
})

router.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;

  const cart = await cartModel.findById(cid).populate("products.product").lean();

  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.render("carts", cart);
});

router.get("/login", isNotAuthenticated, (req, res) => {
    res.render("login");
});

router.get("/register", isNotAuthenticated, (req, res) => {
    res.render("register")
});

export default router;