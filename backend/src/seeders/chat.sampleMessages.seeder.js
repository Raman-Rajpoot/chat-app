import mongoose from "mongoose";
import dotenv from "dotenv";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";


const seedChats = async () => {
  try {
    console.log("Seeding Chats...");

    // Fetch two random users for one-on-one chat
    const users = await User.find().limit(5); // Ensure at least 5 users exist
    if (users.length < 2) {
      console.log("Not enough users to create chats!");
      return;
    }

    const userA = users[0];
    const userB = users[1];

    // Create a one-on-one chat
    const oneOnOneChat = await Chat.create({
      members: [userA._id, userB._id],
      isGroup: false,
    });

    // Create sample messages
    await Message.create([
      {
        sender: userA._id,
        chat: oneOnOneChat._id,
        content: "Hey! How's it going?",
      },
      {
        sender: userB._id,
        chat: oneOnOneChat._id,
        content: "I'm good! How about you?",
      },
    ]);

    console.log("One-on-One Chat Created ✅");

    // Create a group chat with 3+ users
    const groupMembers = users.slice(0, 4).map((user) => user._id);
    const groupChat = await Chat.create({
      members: groupMembers,
      isGroup: true,
      groupName: "Study Group",
    });

    await Message.create([
      {
        sender: groupMembers[0],
        chat: groupChat._id,
        content: "Hey everyone! Let's start our discussion.",
      },
      {
        sender: groupMembers[1],
        chat: groupChat._id,
        content: "Sounds great!",
      },
    ]);

    console.log("Group Chat Created ✅");

    console.log("Seeding Completed! 🎉");
    
  } catch (error) {
    console.error("Seeding Error:", error);
    
  }
};

// Run Seeder
seedChats();
