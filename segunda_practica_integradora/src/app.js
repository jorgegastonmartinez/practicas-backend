import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import mongoose from './config/database.js';
import MongoStore from 'connect-mongo';
import __dirname from './utils.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';

import sessionsRouter from './routes/api/sessions.js';
import viewsRouter from './routes/views.router.js';
import cartsRouter from "./routes/carts.router.js";
import productsRouter from "./routes/products.router.js";

const app = express();
const PORT = 8080;

app.engine('handlebars', engine({
    extname: '.handlebars',
    defaultLayout: 'main',
}));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb+srv://Mongojoje:Mongojoje@cluster0.z5uj2rj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0" }),
    cookie: { maxAge: 180 * 60 * 1000 },
}));

app.use(express.json());

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);
app.use("/api", cartsRouter);
app.use("/api", productsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});