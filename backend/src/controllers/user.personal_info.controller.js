// import files
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
// import generateOTP from "../utils/otpGenerator.utils.js";
import sendOTP from "../utils/optSend.utils.js";
import Fuse from "fuse.js";
import { Chat } from "../models/chat.model.js";
import { FriendRequest } from "../models/request.model.js";

import {NEW_REQUEST, REFETCH_CHATS} from "../constants/events.js";
import  {emitEvent}  from "../utils/features.utils.js";


const generateTokens = async (_id) => {
  if (!_id) {
    return null;
  }
  const user = await User.findById(_id);
  if (!user) {
    return null;
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  return { accessToken, refreshToken };
};

const sendOTPRoute = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

      // Send OTP to the user's email
      await sendOTP(email, otp);

      // Save or update the OTP record
      const otpRecord = await OTP.findOneAndUpdate(
          { email },
          { otp, expiresAt },
          { upsert: true, new: true }
      );

      res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};

const verifyOTPRoute = async (req, res) => {
  const { email, otp: enteredOTP } = req.body;

  if (!email || !enteredOTP) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
      // Find the OTP record for the provided email
      const otpRecord = await OTP.findOne({ email });

      if (!otpRecord) {
          return res.status(400).json({ success: false, message: "No OTP record found for this email" });
      }

      // Compare the entered OTP with the stored OTP
      const isMatch = otpRecord.otp === enteredOTP;

      if (isMatch) {
          // Mark OTP as verified (optional)
          otpRecord.verified = true;
          await otpRecord.save();

          return res.status(200).json({ success: true, message: "OTP verified successfully" });
      } else {
          return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
  } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ success: false, message: "Server error during OTP verification" });
  }
};

const SignUp = async (req, res) => {
  const { name, email, bio, password, enteredOTP } = req.body;

  // Check for missing required fields
  if (!name || !email || !password || !enteredOTP) {
      return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
      }

      // Verify OTP before signup
      const otpRecord = await OTP.findOne({ email });
      if (!otpRecord || otpRecord.otp !== enteredOTP) {
          return res.status(400).json({ message: "Invalid OTP" });
      }

      // Create a new user
      const newUser = await User.create({
          name,
          email,
          bio,
          password,
      });

      // Retrieve the user without password
      const createdUser = await User.findOne({ email }).select("-password -refreshToken");

      // Send response
      return res.status(201).json({
          user: createdUser,
          message: "User registered successfully",
      });
  } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Error during user registration" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  // Validate email format (optional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({
          message: "Email is not valid",
      });
  }

  try {
      const user = await User.findOne({ email });
      console.log("User: ",user)
      if (!user) {
          return res.status(404).json({
              message: "User Not Found",
          });
      }
  
      const passwordCheck = await user.comparePassword(password);
      console.log("password check : ",passwordCheck)
      if (!passwordCheck) {
          return res.status(400).json({
              message: "Password is incorrect",
          });
      }

      const tokens = await generateTokens(user._id);
      console.log(tokens);
      if(!tokens){
        return res.status(400).json({
          message: "Error during generating Tokens",
      });
      }
      const { accessToken, refreshToken } = tokens;
      if (!accessToken || !refreshToken) {
          return res.status(400).json({
              message: "Error during generating Tokens",
          });
      }

      const loginUser = await User.findById(user._id).select("-password -refreshToken");

       console.log("Login User: ",loginUser)

      console.log(accessToken)
      return res.status(200).json({
          message: "Login Success",
          data: {
              user: loginUser,
              accessToken: accessToken,
          },
      });
  } catch (err) {
      return res.status(400).json({
          message: `Error During Login ${err}`,
      });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

const getUser = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  return res.status(200).json({
    user,
    message: "User retrieved successfully",
  });
};


const searchUserFuzzy = async (req, res) => {
  const { search } = req.query;
  console.log(search)
  if (!search) {
    return res.status(400).json({ message: "Search field is empty" });
  }
  
  try {
    
    const users = await User.aggregate([
      {
        $search: {
          index: "Users", 
          text: {
            query: search,
            path: ["name", "email"], 
            fuzzy: {
              maxEdits: 2, 
              prefixLength: 1, 
            },
          },
        },
      },
      {
        $project: { password: 0, refreshToken: 0 }, 
      },
    ])
   
    return res.status(200).json({
      user:users,
      message: "Users retrieved successfully (fuzzy search)"
    });
  } catch (error) {
    console.error("Error during fuzzy search:", error);
    return res.status(500).json({ message: "Error during search" });
  }
};


const searchMyChat = async (req, res) => {
  const { search } = req.body;
  // console.log("Search term:", search);
  if (!search) {
    return res.status(400).json({ message: "Search field is empty" });
  }

  try {
   
    const chats = await Chat.find({ members: req.user._id })
      .populate("members", "name email")
      .lean();
    

    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "No chats found" });
    }

    const chatsForSearch = chats.map(chat => {
      if (chat.isGroupChat) {
        return { ...chat, searchText: chat.groupName || chat.chatName || "" };
      } else {
        // For one-on-one chats, find the other member.
        const otherMember = chat.members.find(
          member => member._id.toString() !== req.user._id.toString()
        );
        const searchText = otherMember
          ? `${otherMember.name} ${otherMember.email || ""}`
          : "";
        return { ...chat, searchText };
      }
    });
    // console.log("Chats prepared for search:", chatsForSearch);

    // Configure Fuse.js options to use the unified searchText.
    const options = {
      keys: ["searchText"],
      threshold: 0.3, // Adjust threshold (lower is stricter)
    };

    const fuse = new Fuse(chatsForSearch, options);
    
    const results = fuse.search(search);
    // console.log("Fuse search results:", results);

    // Extract chat objects from Fuse.js results.
    const filteredChats = results.map(result => result.item);
    // console.log("Filtered chats:", filteredChats);

    return res.status(200).json({
      chats: filteredChats,
      message: "Chats retrieved successfully",
    });
  } catch (error) {
    console.error("Error during fuzzy searchMyChat:", error);
    return res.status(500).json({ message: "Error during searchMyChat" });
  }
};

 const sendFriendRequest = async (req, res) => {
  console.log("sending friend")
  const { userId } = req.body;
  console.log(userId)
  const user = req.user;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const userTo = await User.findById(userId).select("-password -refreshToken"); 
    if(!userTo) {
      return res.status(404).json({ message: "User not found" });
    }
    const requestExists = await FriendRequest.findOne({
      $or: [
        { sender: user._id, receiver: userId },
        { sender: userId, receiver: user._id }
      ]
    });
    if (requestExists) {
      return res.status(400).json({ message: "Request already sent or user sent you a requst" });
    }
   
    const newRequest = await FriendRequest.create({
      sender: user._id,
      receiver: userId,
    });
    emitEvent(NEW_REQUEST, userTo._id, user, newRequest);
     
    return res.status(200).json({
      request: newRequest,
      message: "Request sent successfully",
    });

  } catch (error) {
    console.error("Error sending request:", error);
    return res.status(500).json({ message: "Error sending request" });
  }
 }

 
const accepteFriendRequest = async (req, res) => {
  const { requestId, accept } = req.body;
  console.log(requestId);
  if (!requestId) {
    return res.status(400).json({ message: "RequestId is required" });
  }

  try {
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized to accept this request" });
    }
  if(accept === false){
    await request.deleteOne();
    return res.status(200).json({ message: "Request rejected by friend" });
  }
    const members = [request.sender._id, request.receiver._id];
   await Promise.all([
     Chat.create({
      members,
      isGroupChat: false,
      name: `${request.sender.name}-${req.user.name}`,
    }),
    request.deleteOne()
    ]);

  
    emitEvent(req, REFETCH_CHATS, [request.sender], { message: `${req.user.name} accepted your friend request` });

    return res.status(200).json({ message: "Request accepted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error accepting request", error });
  }
}

const getNotifications = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user._id })
      .populate("sender", "name email avatar")
      .lean();

      const notifications = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
          _id: sender._id,
          name: sender.name,
          email: sender.email,
          avatar: sender.avatar?.url || "" 
        }
      }));
    return res.status(200).json({ requests: notifications, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Error getting notifications", error });
  }
}


const getMyFriends = async (req, res) => {
  try {
    const {chatId} = req?.query;
    console.log(chatId, req.user)
    const chat = await Chat.find({members : req.user?._id, isGroupChat: false}).populate("members", "name email avatar").lean();
   console.log("chat : ",chat)
  
    const friends = chat?.members?.filter(member => member?._id.toString() !== req.user?._id.toString())
  .map(friend => ({
    _id: friend?._id,
    name: friend?.name,
    email: friend?.email,
    avatar: friend?.avatar?.url || ""
  }));
console.log("friends : ",friends)
  if(chatId){
    const chat = await Chat.findById(chatId);
    
    const availableFriends = friends.filter(friend => !chat.members.includes(friend._id));
    return res.status(200).json({ friends: availableFriends, success: true });
  }else{
    return res.status(200).json({ friends, success: true });
  }

  } catch (error) {
    return res.status(500).json({ message: "Error getting notifications", error });
  }
}

export 
  { 
    SignUp,
    Login,
    getUser,
    sendOTPRoute,
    verifyOTPRoute,
    logout,
    searchUserFuzzy,
    searchMyChat,
    sendFriendRequest,
    accepteFriendRequest,
    getNotifications, 
    getMyFriends
  };
