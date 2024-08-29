import express from 'express';
import dotenv from "dotenv";
import session from 'express-session';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import mongoose from './config/database.js';
import MongoStore from 'connect-mongo';
import __dirname from './utils.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import { Server } from "socket.io";
import swaggerJsDoc from 'swagger-jsdoc';
import SwaggerUiExpress from 'swagger-ui-express';

import sessionsRouter from './routes/api/sessions.js';
import viewsRouter from './routes/views.router.js';
import cartsRouter from "./routes/carts.router.js";
import productsRouter from "./routes/products.router.js";
import "./config/passport.config.js";
import adminRouter from "./routes/admin.router.js";
import messageRouter from "./routes/messages.router.js";
import ticketRouter from "./routes/ticket.router.js"
import { sessionLogger } from './middleware/auth.js';
import userRouter from "./routes/user.router.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

const httpServer = app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})
const socketServer = new Server(httpServer);

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Ecommerce API Documentation",
            description: "Esta es la documentación de la API para un sistema de e-commerce, que permite a los usuarios ver productos, gestionar carritos de compras, realizar pedidos.",
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/apidocs', SwaggerUiExpress.serve, SwaggerUiExpress.setup(specs));

app.engine('handlebars', engine({
    extname: '.handlebars',
    defaultLayout: 'main',
}));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: { maxAge: 180 * 60 * 1000 },
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(sessionLogger)

app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);
app.use('/api', cartsRouter);
app.use('/api', productsRouter);
app.use('/api', adminRouter);
app.use('/api/messages', messageRouter);
app.use('/api', ticketRouter);
app.use("/api/users", userRouter);

socketServer.on("connection", (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});