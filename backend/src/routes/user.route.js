import express from "express";
import { Login, getUser, sendOTPRoute, verifyOTPRoute, SignUp } from "../controllers/user.personal_info.controller.js";
import { Authorization } from "../middlewares/auth.middleware.js";
// import multer from "multer";
import upload from "../middlewares/multer.middleware.js";

const userRouter = express.Router();

console.log(Login);

// Routes
userRouter.post("/signup",upload.single('avatar'), SignUp);              
userRouter.post("/login", Login);                
userRouter.get("/getuser", Authorization, getUser);
userRouter.post("/send-otp", sendOTPRoute);        
userRouter.post("/verify-otp", verifyOTPRoute);    

export default userRouter;
