import { Chat } from "../models/chat.model.js";
import {emitEvent} from "../utils/features.utils.js";
import {deleteFileFromCloudinary} from "../utils/features.utils.js";
import  { ALERT, REFETCH_CHATS,NEW_ATTACHMENT, NEW_MESSAGE } from "../constants/events.js";
import { User } from "../models/user.model.js";
// const { ALERT, REFETCH_CHATS,NEW_ATTACHMENT, NEW_MESSAGE } = events;
// import upload/ from "../middlewares/upload.middleware.js";
import { Message } from "../models/message.model.js";

const createGroupChat = async (req, res) => {
  try {
    const { chatName, participants } = req.body;
    console.log(chatName, participants);
    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: "Participants are required" });
    }

    const allMembers = [...participants, req.user];
    console.log(allMembers);
    if (allMembers.length > 100) {  // Limit group chat members to 100
      return res.status(400).json({ message: "Group chat can't have more than 100 members" }); 
     }

    const chat = await Chat.create({ chatName, isGroupChat : true, creator : req.user,  members : allMembers });
   console.log(chat,allMembers);
    // emitEvent(req,ALERT, allMembers, { message: `${req?.user?.name} created a group chat` });

    // emitEvent(req,REFETCH_CHATS, participants )

    return res.status(201).json({ chat, message: "Group created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating group",error });
  }
};

const getMyChats = async (req, res) => {
  try {
    console.log("started chat...");
    const user = req.user;
    console.log(user);

    // Populate the members field to include avatar and name
    const chats = await Chat.find({ members: user._id })
      

    console.log(chats);

    const transformedChats = chats.map(({ _id, isGroupChat, chatName, creator, members }) => {
      console.log(_id, chatName, isGroupChat, creator, members);
      return {
        _id,
        chatName,
        isGroupChat,
        creator,
        avatar: !isGroupChat
          ? [members.find(member => member?._id?.toString() !== user._id?.toString())?.avatar?.url]
          : members.slice(0, 3).map(member => member?.avatar?.url),
        members: members.reduce((acc, member) => {
          if (member?._id?.toString() !== user?._id?.toString()) {
            acc.push({ _id: member?._id, name: member?.name });
          }
          return acc;
        }, []),
      };
    });

    console.log("transform chat : ", transformedChats);
    return res.status(200).json({ chats: transformedChats, message: "Chats fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chats", error });
  }
};


// create route for get group created by me




const addMembersToGroup = async (req, res) => {
  const { chatId, members } = req.body;
 
  if (!chatId || !members ||  members.length === 0) {
    return res.status(400).json({ message: "ChatId and members are required" });
  }

  try{
    const chat = await Chat.findById(chatId);
    if(!chat){
      return res.status(404).json({ message: "Chat not found" });
    }
    if(chat.creator.toString() !== req.user._id.toString()){
      return res.status(401).json({ message: "You are not authorized to add member to this group" });
    }
    if(!chat.isGroupChat){
      return res.status(400).json({ message: "This is not a group chat" });
    }
    const filtermembers = members.filter(member => !chat.members.includes(member));

    if (filtermembers.length === 0) {
      return res.status(400).json({ message: "members are required" });
    }

   const allMembersPromise = filtermembers.map(memberId => User.findById(memberId, "name"));
    const allMembers = await Promise.all(allMembersPromise);
    chat.members.push(...allMembers.map(member => member._id));
    if(chat.members.length > 100){
      return res.status(400).json({ message: "Group chat can't have more than 100 members" });
    }
    await chat.save();

    // emitEvent(req, ALERT, chat.members, { message: `You have been added to ${chat.chatName} group by ${req.user.name}` });

    // emitEvent(req, REFETCH_CHATS, chat.members);
    return res.status(200).json({ message: "Member added successfully", allMembers });
  }
  catch(error){
    return res.status(500).json({ message: "Error adding member to group", error });
  }
}

const removeMember = async (req, res) => {
  const { chatId, member } = req.body;
  if (!chatId || !member) {
    return res.status(400).json({ message: "ChatId and member are required" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized to remove a member from this group" });
    }
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: "This is not a group chat" });
    }
    
    if(chat.members.length <=3){
      return res.status(400).json({ message: "Group chat must have at least 2 members" });
    }
      
    if (!chat.members.includes(member)) {
      return res.status(400).json({ message: "Member not found in this group" });
    }

    // Remove the member
    chat.members = chat.members.filter(m => m.toString() !== member.toString());


    await chat.save();

    // Notify the removed member
    emitEvent(req, ALERT, [member], { message: `You have been removed from ${chat.chatName} group by ${req.user.name}` });

    // Notify remaining group members
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error removing member from group", error });
  }
};


const leaveGroup = async (req, res) => {
  const  chatId  = req.params.id;
  console.log(chatId);
  if (!chatId) {
    return res.status(400).json({ message: "ChatId is required" });
  }

  try {
    const chat = await Chat.findById(chatId);
    // console.log(chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: "This is not a group chat" });
    }
    if (!chat.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }
    
    if (chat.members.length <= 3) {
      return res.status(400).json({ message: "Group chat must have at least 2 members" });
    }

console.log(chat.creator.toString(), req.user._id.toString());
    // Remove the member
   const rem_members = chat.members.filter(m => {
      return String(m) !== String(req.user._id);
    });
    
    
    if (chat.creator.toString() == req.user._id.toString()) {
      const randomMember = rem_members[Math.floor(Math.random() * rem_members.length)];
      chat.creator = randomMember;
    }
    console.log("okkk")
    chat.members = rem_members;
    await chat.save();

    // Notify the removed member
    emitEvent(req, ALERT, [req.user._id], { message: `You have left ${chat.chatName} group` });

    // Notify remaining group members
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({ message: "You have left the group successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error leaving group", error });
  }
}


const sendAttachment = async (req, res) => {
  try {
    const { chatId } = req.body;
    console.log("Chat ID:", chatId);

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is missing" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this chat" });
    }

    // Files Handling
    const files = req.files || [];
    console.log("Uploaded Files:", files);

    if (files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Convert files to attachment format
    const attachments = files.map(file => ({
      url: file.path,
      type: file.mimetype,
      name: file.originalname
    }));

    console.log("Attachments:", attachments);

    // Save the message
    const message = await Message.create({
      sender: req.user._id,
      attachments: attachments,
      chat: chatId,
      content: "",
    });

    return res.status(200).json({ message: "Attachment sent successfully", data: message });
  } catch (error) {
    console.error("Error in sendAttachment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getChats = async (req, res) => {
  try {
    // Convert req.query.populate to a boolean
    const shouldPopulate = req.query.populate === "true";

    if (shouldPopulate) {
      console.log("Populating chats...");
      
      const chats = await Chat.find({ members: req.user._id })
        .populate("members", "name avatar")
        .lean();

      if (!chats || chats.length === 0) {
        return res.status(404).json({ message: "No chat found" });
      }

      // Format members' avatar URLs before sending response
      const formattedChats = chats.map(chat => ({
        ...chat,
        members: chat.members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar?.url,  // Handle cases where avatar might be undefined
        })),
      }));

      return res.status(200).json({ chats: formattedChats });
    } else {
      console.log("Not populating chats...");

      const chats = await Chat.find({ members: req.user._id });

      if (!chats || chats.length === 0) {
        return res.status(404).json({ message: "No chat found" });
      }

      return res.status(200).json({ chats });
    }
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const renameGroup = async (req, res) => {
  const { chatName } = req.body;
  const chatId = req.params.id;
  console.log(chatId, chatName);
  if (!chatId || !chatName) {
    return res.status(400).json({ message: "ChatId and chatName are required" });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized to rename this group" });
    }

    chat.chatName = chatName;
    await chat.save();

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({ message: "Group renamed successfully", chatName });
  } catch (error) {
    return res.status(500).json({ message: "Error renaming group", error });
  }
};

const deleteChat = async (req, res) => {
  const chatId = req.params.id;
  console.log(chatId);
  if (!chatId) {
    return res.status(400).json({ message: "ChatId is required" });
  }

  try {
    const chat = await Chat.findById(chatId);
    console.log(chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
   console.log(chat.isGroupChat, chat.creator.toString(), req.user._id.toString());
    if (chat.isGroupChat && chat.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized to delete this chat" });
    }
    if(!chat.isGroupChat && !chat.members.includes(req.user._id)){
       return res.status(401).json({ message: "You are not authorized to delete this chat" });
      }
  
      const attachments = await Message.find({ chat: chatId, attachments: { $exists: true } });
      console.log(attachments);
      const public_id = [];
      attachments.forEach(attachment => {
        attachment.attachments.forEach(file => {
          public_id.push(file.public_id);
        });
      });
      console.log(public_id);
    await Promise.all([
      deleteFileFromCloudinary(public_id),
      Message.deleteMany({ chat: chatId }),
      Chat.findByIdAndDelete(chatId),

    ])
 console.log("okkk")
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({ message: "Chat deleted successfully", chatId });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting chat", error });
  }
}

const getMesasages = async (req, res) => {
  try {
    const chatId = req.params.id;
    const {page = 1} = req.query;
    const limit = 20
    const skip = (page - 1) * limit;
    console.log(chatId);
    if (!chatId) {
      return res.status(400).json({ message: "ChatId is required" });
    }
    const [messages, totalMessagesCount] = await Promise.all([Message.find({ chat: chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      Message.countDocuments({ chat: chatId })
    ]);

    const totalPages = Math.ceil(totalMessagesCount / limit);
    console.log(totalMessagesCount, totalPages);

    return res.status(200).json({ messages : messages.reverse(), message: "Messages fetched successfully",success: true });

  } catch (error) {
    return res.status(500).json({ message: "Error fetching messages", error });
  }
}


export default{
  createGroupChat,
  getMyChats,
  addMembersToGroup,
  removeMember,
  leaveGroup,
  sendAttachment,
  getChats,
  renameGroup,
  deleteChat,
  getMesasages,
  
 };
