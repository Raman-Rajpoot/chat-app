import express from "express";
import chatController from "../controllers/chat.controller.js";
const { createGroupChat, getMyChats ,addMembersToGroup, removeMember} = chatController;
import { Authorization } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.post("/new/group",Authorization, createGroupChat);
chatRouter.get("/get-mychat",Authorization, getMyChats);
chatRouter.put("/add-members",Authorization, addMembersToGroup);
chatRouter.put("/remove-members",Authorization, removeMember);

export default chatRouter;
