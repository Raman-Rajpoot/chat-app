import { Chat } from "../models/chat.model.js";
import {emitEvent} from "../utils/features.utils.js";
import {deleteFileFromCloudinary} from "../utils/features.utils.js";
import  { ALERT, REFETCH_CHATS,NEW_ATTACHMENT, NEW_MESSAGE } from "../constants/events.js";
import { User } from "../models/user.model.js";
// const { ALERT, REFETCH_CHATS,NEW_ATTACHMENT, NEW_MESSAGE } = events;
// import upload/ from "../middlewares/upload.middleware.js";
import { Message } from "../models/message.model.js";
import mongoose from "mongoose"; 

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

const addMembersToGroup = async (req, res) => {
  const { chatId, members } = req.body;
  console.log('Add members request:', { chatId, members });

  if (!chatId || !members?.length) {
    return res.status(400).json({ 
      message: "Chat ID and members array are required",
      received: { chatId, memberCount: members?.length || 0 }
    });
  }

  try {
    // 1. Chat Validation
    const chat = await Chat.findById(chatId).lean();
    console.log('Chat found:', !!chat);
    
    if (!chat) {
      return res.status(404).json({ 
        message: "Chat not found",
        chatId,
        suggestion: "Verify the chat ID and user permissions"
      });
    }

    // 2. Authorization Check
    const isCreator = chat.creator.toString() === req.user._id.toString();
    console.log('User is creator:', isCreator);
    
    if (!isCreator) {
      return res.status(403).json({
        message: "Unauthorized operation",
        requiredRole: "chat creator",
        currentUser: req.user._id
      });
    }

    // 3. Group Chat Validation
    if (!chat.isGroupChat) {
      return res.status(400).json({
        message: "Invalid chat type",
        requiredType: "group chat",
        currentType: "direct chat"
      });
    }

    // 4. Member ID Processing
    const validMembers = members.filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );
    
    if (validMembers.length !== members.length) {
      const invalidIds = members.filter(id => 
        !mongoose.Types.ObjectId.isValid(id)
      );
      
      return res.status(400).json({
        message: "Invalid member ID format",
        invalidIds,
        exampleValidId: new mongoose.Types.ObjectId(),
        invalidCount: invalidIds.length
      });
    }

    // 5. Convert to ObjectIDs
    const targetUserIds = validMembers.map(id => new mongoose.Types.ObjectId(id));
    console.log('Converted member IDs:', targetUserIds);

    // 6. User Existence Check
    const existingUsers = await User.find(
      { _id: { $in: targetUserIds } },
      { _id: 1, name: 1 }
    ).lean();
    
    console.log('Found users:', existingUsers);

    if (existingUsers.length !== targetUserIds.length) {
      const foundIds = new Set(existingUsers.map(u => u._id.toString()));
      const missingIds = validMembers.filter(id => !foundIds.has(id));
      
      return res.status(404).json({
        message: "Some users not found",
        missingIds,
        existingCount: existingUsers.length,
        requestedCount: targetUserIds.length
      });
    }

    // 7. Existing Member Check
    const currentMemberIds = new Set(chat.members.map(m => m.toString()));
    console.log('Current member IDs:', [...currentMemberIds]);

    const newMembers = existingUsers.filter(user => 
      !currentMemberIds.has(user._id.toString())
    );
    
    console.log('New members to add:', newMembers.map(m => m._id));

    if (!newMembers.length) {
      return res.status(400).json({
        message: "No new members to add",
        existingMembers: [...currentMemberIds],
        attemptedAdditions: validMembers
      });
    }

    // 8. Group Size Validation
    const projectedSize = chat.members.length + newMembers.length;
    console.log('Projected group size:', projectedSize);
    
    if (projectedSize > 100) {
      return res.status(400).json({
        message: "Group size limit exceeded",
        currentSize: chat.members.length,
        attemptedAdditions: newMembers.length,
        maxAllowed: 100
      });
    }

    // 9. Update Operation
    const updateResult = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { members: { $each: newMembers.map(m => m._id) } } },
      { new: true, runValidators: true }
    ).populate('members', 'name email');
    

    // 10. Response Formatting
    const addedMembers = newMembers.map(m => ({
      _id: m._id,
      name: m.name,
      addedAt: new Date().toISOString()
    }));

    return res.status(200).json({
      message: "Members added successfully",
      addedCount: addedMembers.length,
      addedMembers,
      newTotalMembers: updateResult.members.length
    });

  } catch (error) {
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      message: "Operation failed",
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
      requestDetails: {
        chatId,
        memberCount: members?.length,
        userId: req.user?._id
      }
    });
  }
};


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
    console.log(chat);
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
const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log(chatId)
    const userId = req.user?._id; // Ensure `req.user` exists

    if (!userId) {
      return res.status(403).json({ 
        message: "User is not authorized to get info", 
        success: false 
      });
    }

    const chatDetail = await Chat.findById(chatId).populate('members', '_id name email avatar');

    if (!chatDetail) {
      return res.status(404).json({
        message: "Chat not found",
        success: false
      });
    }

    return res.status(200).json({ 
      message: "Chat details fetched successfully",
      success: true,
      data: chatDetail
    });

  } catch (err) {
    return res.status(500).json({ 
      message: "Error during fetching info", 
      success: false, 
      error: err.message 
    });
  }
};

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
  getChatDetails
 };
