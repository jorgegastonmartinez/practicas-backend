import mongoose from "mongoose";

const productCollection = "Productos";

const productSchema = new mongoose.Schema({

});

const productModel = mongoose.model(productCollection, productSchema);

export default productModel;