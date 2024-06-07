import mongoose from "mongoose";

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({
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
                    min: 1,
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
    this.populate("products.product")
})

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

export default cartsModel;