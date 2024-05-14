import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors"
import router from "./app-config/routes";
import session from "express-session";
import dotenv from 'dotenv';
import GlobalErrorHandler from "./middleware/error_controller";
import { errorMiddleware } from "./middleware/error_handler";

import admin from 'firebase-admin';
import serviceAccount from './push-notification-flutte-ed09c-firebase-adminsdk-7y9jd-d59f557bf5.json';

dotenv.config();

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
 });

const app = express();
app.use(express.json());


app.use(
    session({
      secret: process.env.SESSION_KEY ?? "",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 180000, // 3 minutes in milliseconds
        }
    })
);

const logger = (req: Request, res: Response, next: NextFunction) => {
    const logData = `[${new Date().toISOString()}] ${req.body} ${req.method} ${req.url}\n`;
    console.log(logData);
    next();
};

app.use(logger);
app.use(cors());


const MONGO_URL = "mongodb://localhost:27017";
// const MONGO_URL = process.env.CONNECTION_STRING ?? "";
mongoose.connect(MONGO_URL, {
    dbName: process.env.DATABASE_NAME,
}).then(() => {
    console.log("Database connected");
}).catch((error) => console.log(error));

app.use('/api/v1', router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    errorMiddleware(err, req, res, next);
});

app.use(GlobalErrorHandler.handle());

app.listen(4000, () => {
    console.log(`Server running on port 4000`);
});



