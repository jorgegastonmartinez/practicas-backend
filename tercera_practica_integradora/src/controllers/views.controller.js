import productModel from "../models/product.model.js";
import messageModel from '../models/message.model.js';
import cartModel from "../models/cart.model.js";

export const renderLogin = async (req, res) => {
    res.render("login", {});
};

export const renderProducts = async (req, res) => {
    let page = parseInt(req.query.page);
    if (!page) page = 1;

    let result = await productModel.paginate({}, { page, limit: 10, lean: true });result.prevLink = result.hasPrevPage
    ? `http://localhost:8080/products?page=${result.prevPage}`
    : '';
    result.nextLink = result.hasNextPage
    ? `http://localhost:8080/products?page=${result.nextPage}`
    : '';
    result.isValid = !(page <= 0 || page > result.totalPages);

    const user = req.session.user;

    res.render("products", { ...result, user});
};

export const renderCart = async (req, res) => {
    const { cid } = req.params;

    const user = req.session.user;

    const cart = await cartModel.findById(cid).populate('products.product').populate('user').lean();

    if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.render("carts", {cart, user});
};

export const renderLoginPage = (req, res) => {
    res.render("login");
};

export const renderRegisterPage = (req, res) => {
    res.render("register");
};

export const getProductsForAdmin = async (req, res) => {
    let page = parseInt(req.query.page);
    if (!page) page = 1;

    let result = await productModel.paginate({}, { page, limit: 10, lean: true });
    result.prevLink = result.hasPrevPage
    ? `http://localhost:8080/admin/products?page=${result.prevPage}`
    : '';
    result.nextLink = result.hasNextPage
    ? `http://localhost:8080/admin/products?page=${result.nextPage}`
    : '';
    result.isValid = !(page <= 0 || page > result.totalPages);

    const user = req.session.user;
    const messages = await messageModel.find().populate('user').lean();

    res.render("admin-products", { ...result, user, messages });
};

export const deleteMessage = async (req, res) => {
    try {
        const { mid } = req.params;
        await messageModel.findByIdAndDelete(mid);
        res.status(200).send('Mensaje eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};