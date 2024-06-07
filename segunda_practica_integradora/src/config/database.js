import mongoose from "mongoose";

mongoose.connect("mongodb+srv://Mongojoje:Mongojoje@cluster0.z5uj2rj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

export default db;