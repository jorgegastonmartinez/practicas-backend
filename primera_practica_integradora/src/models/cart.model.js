import mongoose from "mongoose";

const cartCollection = "Carritos";

const cartSchema = new mongoose.Schema({
  products: [
    {
      quantity: { type: Number, default: 0 },
    },
  ],
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;