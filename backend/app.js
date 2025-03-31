// Import packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuid } from "uuid";
// Import files
import connectDB from "./src/db/db.js";
import userRouter from "./src/routes/user.route.js";
import chatRouter from "./src/routes/chat.routes.js";
import seedUsers from "./src/seeders/user.seeder.js";
import {Server} from "socket.io";
import { createServer } from "http";
import { EDITORCHANGE, NEW_MESSAGE, NEW_MESSAGE_AlERT } from "./src/constants/events.js";
import { getSockets } from "./src/utils/socket.utils.js";
import { Message } from "./src/models/message.model.js";
;

import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import socketAuthMiddleware from "./src/middlewares/socket.middleware.js";


// Initializations
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

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

socketAuthMiddleware(io);

// Database connection
connectDB()
console.log("Database going to connect.....");



// Routes
app.get("/", (req, res) => {
    res.send("Hello from Express");
});

  
app.use("/user", userRouter);
app.use("/chat", chatRouter);

export const userSocketIDs = new Map();    // {socketId: roomId}   

io.on("connection",async (socket) => {
    console.log("a user connected",socket.id);

    const user = socket.user
   console.log("user : ",user);
   userSocketIDs.set(user._id.toString(),socket.id);


    socket.on(NEW_MESSAGE,async({chatId, members, message}) => {
        console.log("message : ",message);
        console.log("chatId : ",chatId);
        console.log("members : ",members);
    

     const messageForDB = {
        chat: chatId,
        content : message,
        sender : user._id,
     }

     try{
        const newMessage = new Message(messageForDB);
        await newMessage.save();
        
     const messageForRealTime = {
        chat: chatId, 
        _id : newMessage._id,
        
        content : message,
        sender : {
            _id : user._id,
            name : user.name
        },
        createdAt : new Date().toISOString()
     }
     const userSockets = getSockets(members);
    io.to(userSockets).emit(NEW_MESSAGE, {
        message:  messageForRealTime ,
        chatId,
    });
    io.to(userSockets).emit(NEW_MESSAGE_AlERT, {chatId});  

   
        
   io.emit(NEW_MESSAGE,  messageForRealTime );
    }catch(err){
        console.log(err);
        
   }

    });
    socket.on(EDITORCHANGE, (data) => {
        const userSockets = getSockets(members);
        io.to(userSockets).emit('editorChange', data);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userSocketIDs.delete(""+user._id);
    });
});


// Start server
const port = process.env.PORT || 7000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default {app};
