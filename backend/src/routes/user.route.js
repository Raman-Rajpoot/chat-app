import express from "express";
import { Login, getUser}  from "../controllers/user.personal_Info.controller.js";
import {SignUp} from "../controllers/user.personal_Info.controller.js"; 
import { Authorization } from '../middlewares/auth.middleware.js';
const userRouter = express.Router();
console.log(Login)
// routes
userRouter.post("/signup", SignUp);
userRouter.post("/login", Login);
userRouter.get('/getuser', Authorization, getUser)
export default userRouter;
