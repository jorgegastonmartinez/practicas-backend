// import mongoose from "mongoose";

// const messageCollection = "Mensajes";

// const messageSchema = new mongoose.Schema({
//   user: { type: String, require: true, max: 100 },
//   message: { type: String, require: true, max: 100 },
// });

// const messageModel = mongoose.model(messageCollection, messageSchema);

// export default messageModel;


import mongoose from 'mongoose';

const messageCollection = "messages";

const messageSchema = new mongoose.Schema({
  user: { type: String },
  message: { type: String },
}); 

const messageModel = mongoose.model(messageCollection, messageSchema);

export default messageModel;
