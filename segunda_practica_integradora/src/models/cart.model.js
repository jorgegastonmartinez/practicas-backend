import mongoose from "mongoose";

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        unique: true,
        required: true,
        },

    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
            },
        ],
        default: [],
    },
    total: {
        type: Number,
        default: 0,
    },
});

cartsSchema.pre("find", function() {
    this.populate("products.product").populate("user")
})

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

export default cartsModel;