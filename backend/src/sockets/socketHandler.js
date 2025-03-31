import { v4 as uuid } from "uuid";
import { Message } from "../models/message.model.js";
import { getSockets } from "../utils/socket.utils.js";
import { NEW_MESSAGE, NEW_MESSAGE_AlERT } from "../constants/events.js";
import { userSocketIDs } from "../utils/socket.utils.js"; // wherever you're maintaining this map

const socketHandler = (io, socket) => {
  console.log("User connected:", socket?.user);

  userSocketIDs.set(socket?.user._id.toString(), socket?.id);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    console.log(message)
    const messageForRealTime = {
      chat: chatId,
      _id: uuid(),
      content: message,
      sender: {
        _id: socket.user._id,
        name: socket.user.name,
      },
      createdAt: new Date().toISOString(),
    };

    const userSockets = getSockets(members);

    io.to(userSockets).emit(NEW_MESSAGE, { message: messageForRealTime, chatId });
    io.to(userSockets).emit(NEW_MESSAGE_AlERT, { chatId });

    try {
      const newMessage = new Message({
        chat: chatId,
        content: message,
        sender: socket.user._id,
      });
      await newMessage.save();
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    userSocketIDs.delete(socket.user._id.toString());
    console.log("User disconnected:", socket.user._id);
  });
};

export default socketHandler;
