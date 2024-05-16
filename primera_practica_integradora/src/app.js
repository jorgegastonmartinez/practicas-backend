import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
//
import __dirname from "./utils.js";
import handlebars from "express-handlebars";

import viewsRouter from "./routes/views.router.js";

import userRouter from "./routes/users.router.js";
import productRouter from "./routes/products.router.js";
import messageRouter from "./routes/messages.router.js";

const app = express();
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
  console.log(`Server is running in PORT ${PORT}`);
})
const socketServer = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", viewsRouter);
app.use(express.static(__dirname + "/public"));
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// Mongoose
mongoose
  .connect(
    "mongodb+srv://Mongojoje:Mongojoje@cluster0.z5uj2rj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Conectado a la base de datos del ecommerse");
  })
  .catch((error) => console.error("Error en la conexión", error));

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

const messages = [];

socketServer.on("connection", (socket) => {
  socket.emit("messageList", messages);

  console.log("Nuevo cliente conectado");

  socket.on("newMessage", (message) => {

    messages.push(message);

    socketServer.emit("newMessage", {
      user: socket.id,
      message: message,
    });
  });
});