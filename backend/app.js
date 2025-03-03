// Import packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import files
import connectDB from "./src/db/db.js";
import userRouter from "./src/routes/user.route.js";
import chatRouter from "./src/routes/chat.routes.js";
import seedUsers from "./src/seeders/user.seeder.js";
import {Server} from "socket.io";
// Initializations
const app = express();



dotenv.config();


// Middleware: Enable CORS properly
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);

app.use(express.json()); 
app.use(cookieParser());
// Database connection
connectDB()
console.log("Database going to connect.....");

// Routes
app.get("/", (req, res) => {
    res.send("Hello from Express");
});

app.use("/user", userRouter);
app.use("/chat", chatRouter);



// Start server
const port = process.env.PORT || 7000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default app;
