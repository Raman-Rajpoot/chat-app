import express from "express";
import chatController from "../controllers/chat.controller.js";
const { createGroupChat, getMyChats ,addMembersToGroup, removeMember,leaveGroup,sendAttachment,getChats, renameGroup,deleteChat, getMesasages} = chatController;
import { Authorization } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const chatRouter = express.Router();

chatRouter.post("/new/group",Authorization, createGroupChat);
chatRouter.get("/get-mychat",Authorization, getMyChats);
chatRouter.put("/add-members",Authorization, addMembersToGroup);
chatRouter.delete("/remove-members",Authorization, removeMember);
chatRouter.delete("/leave-group/:id",Authorization, leaveGroup);

chatRouter.post("/send-attachment", upload.array("files"), Authorization, sendAttachment);

chatRouter.get("/get-chats", Authorization, getChats);
chatRouter.put("/rename-group/:id", Authorization, renameGroup);
chatRouter.delete("/delete-chat/:id", Authorization, deleteChat);
chatRouter.get("/get-messages/:id", Authorization, getMesasages);
export default chatRouter;
