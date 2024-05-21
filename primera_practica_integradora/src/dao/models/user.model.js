import mongoose from "mongoose";

const userCollection = "Usuarios";

const userSchema = new mongoose.Schema({
  nombre: { type: String, require: true, max: 50 },
  apellido: { type: String, require: true, max: 50 },
  email: { type: String, require: true, max: 50 },
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;