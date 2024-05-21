import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
  products: [
    {
      quantity: { type: Number, default: 0 },
    },
  ],
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;