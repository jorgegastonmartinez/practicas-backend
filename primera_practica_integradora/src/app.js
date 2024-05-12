import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/users.router.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://Mongojoje:Mongojoje@cluster0.z5uj2rj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Conectado a la base de datos del ecommerse");
  })
  .catch((error) => console.error("Error en la conexión", error));

app.use("/api/users", userRouter)

app.listen(PORT, () => {
    console.log(`Server is running in PORT ${PORT}`);
})