import { Chat } from "../models/chat.model.js";
import emitEvent from "../utils/features.utils.js";
import events from "../constants/events.js";
import { User } from "../models/user.model.js";
const { ALERT, REFETCH_CHATS } = events;


const createGroupChat = async (req, res) => {
  try {
    const { chatName, participants } = req.body;
    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: "Participants are required" });
    }
    const allMembers = [...participants, req.user];
    

    const chat = await Chat.create({ chatName, isGroupChat : true, creator : req.user,  members : allMembers });

    emitEvent(req,ALERT, allMembers, { message: `${req.user.name} created a group chat` });

    emitEvent(req,REFETCH_CHATS, participants )

    return res.status(201).json({ chat, message: "Group created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating group",error });
  }
};


const getMyChats = async (req, res) => {
  try {
    const user = req.user;
    const chats = await Chat.find({ members: user._id }).populate("members", "name avatar");

    const transformedChats = chats.map(({ _id, chatName, isGroupChat, creator, members }) => {
      return {
        _id,
        chatName,
        isGroupChat,
        creator,
        avatar: !isGroupChat
          ? [members.find(member => member._id.toString() !== user._id.toString()).avatar.url]
          : members.slice(0, 3).map(member => member.avatar.url),
        members: members.reduce((acc, member) => {
          if (member._id.toString() !== user._id.toString()) {
            acc.push({ _id: member._id, name: member.name });
          }
          return acc;
        }, []),
      };
    });

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

    emitEvent(req, ALERT, chat.members, { message: `You have been added to ${chat.chatName} group by ${req.user.name}` });

    emitEvent(req, REFETCH_CHATS, chat.members);
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
  if (!chatId) {
    return res.status(400).json({ message: "ChatId is required" });
  }

  try {
    const chat = await Chat.findById(chatId);

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

    // Remove the member
    rem_members = chat.members.filter(m => m.toString() !== req.user._id.toString());
    if (chat.creator.toString() === req.user._id.toString()) {
      const randomMember = rem_members[Math.floor(Math.random() * rem_members.length)];
      chat.creator = randomMember;

    }
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

export default{
  createGroupChat,
  getMyChats,
  addMembersToGroup,
  removeMember
 };
