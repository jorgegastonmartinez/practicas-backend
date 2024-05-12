import mongoose from "mongoose";

const cartCollection = "Carritos";

const cartSchema = new mongoose.Schema({

});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;