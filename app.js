import express from 'express';
import {config} from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import colors from 'colors';
import cookieParser from 'cookie-parser';
import ErrorMiddleware from './middlewares/Error.js'


config({
    path:"./.env",
})
const app=express();

//Using Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}))
app.use(morgan('dev'));
app.use(cookieParser());


//Importing & Using Routes
import course from './routes/courseRoutes.js'
import user from './routes/userRoutes.js';
import payment from './routes/paymentRoutes.js';

app.use("/api/v1",course)
app.use("/api/v1",user)
app.use("/api/v1",payment)


export default app;

app.use(ErrorMiddleware);