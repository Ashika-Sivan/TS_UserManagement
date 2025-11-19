import express, { Application, Request, Response,NextFunction} from "express";
import dotenv from "dotenv";
const flash = require("express-flash");
dotenv.config();


import connectDB from "./config/database";
import userRoutes from "./routes/userRoute";
import adminRoutes from "./routes/adminRoutes";
import path from 'path';
import session from "express-session";

const app: Application = express();
app.use(flash());

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

console.log("Views directory:", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "mySecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 24
        }
    })
);



app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
});




app.use("/", userRoutes);
app.use('/admin',adminRoutes);



app.get("/test", (req: Request, res: Response) => {
    console.log("Test route accessed");
    res.send("Server is working!");
});

// app.listen(3000, () => {
//     console.log(` Server running on http://localhost:3000`);
//     console.log(` Register page: http://localhost:3000/register`);
//     console.log(` Login page: http://localhost:3000/login`);
//     console.log(`🧪 Test route: http://localhost:3000/test`);
// });

export default app;