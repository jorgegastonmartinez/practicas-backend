import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    age: Number,
    password: String,
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts"},
    role: { type: String, enum: ["user", "admin", "premium"], default: 'user' },resetPasswordToken: String,
    resetPasswordExpires: Date,
    previousPasswords: [String],
    documents: {
        type: [{
            name: { type: String, required: true },
            reference: { type: String, required: true }
        }],
        default: []
    },
    last_connection: {
        type: Date,
        default: Date.now
    }
});

const usersModel = mongoose.model(userCollection, userSchema);

export default usersModel;