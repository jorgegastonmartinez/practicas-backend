import mongoose from "mongoose";

const productCollection = "Productos";

const productSchema = new mongoose.Schema({
    title: { type: String, require: true, max: 50 },
    description: { type: String, require: true, max: 50 },
    code: { type: String, require: true, max: 50 },
    price: { type: Number, require: true },
    stock: { type: Number, require: true },
    category: { type: String, require: true, max: 50 },
});

const productModel = mongoose.model(productCollection, productSchema);

export default productModel;