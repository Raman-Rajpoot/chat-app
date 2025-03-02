// import files
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
// import generateOTP from "../utils/otpGenerator.utils.js";
import sendOTP from "../utils/optSend.utils.js";
import Fuse from "fuse.js";
import { Chat } from "../models/chat.model.js";
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
// Verify OTP Route (using email)
const verifyOTPRoute = async (req, res) => {
    console.log('verifing');
    const { email, otp: enteredOTP } = req.body;
    console.log(email, enteredOTP);
    if (!email || !enteredOTP) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }
  
    try {
      // Find the OTP record for the provided email
      const otpRecord = await OTP.findOne({ email });
     console.log(otpRecord);
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: "No OTP record found for this email" });
      }
  
      // Compare the entered OTP with the hashed OTP
      const isMatch = otpRecord.otp === enteredOTP;
  console.log(isMatch);
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

const generateTokens = async (_id) => {
  try {
    const user = await User.findById(_id);
    if (!user) return { accessToken: null, refreshToken: null };
    console.log(user);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log(accessToken, refreshToken);
    if (!accessToken || !refreshToken) {
      return { accessToken, refreshToken: null };
    }
    user.refreshToken = refreshToken;
    return { accessToken, refreshToken };
  } catch {
    console.log("Error during generating tokens");
    return { accessToken: null, refreshToken: null };
  }
};

const callVerifyOtpRoute = async (email, enteredOTP) => {
  try {
    const response = await fetch("http://localhost:8000/user/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, enteredOTP }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("OTP verified successfully", data.message);
      return data.success;
    } else {
      console.log("Failed OTP Verification:", data.message);
      return data.success;
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
  }
};

// SignUp Route (using email)
const SignUp = async (req, res) => {
  const { name, email, bio, password, enteredOTP } = req.body;

  // Check for missing required fields
  if (!name || !email || !password) {
    return res.status(404).json({ message: "Required fields are missing" });
  }
  // if (!enteredOTP) {
  //   return res.status(404).json({ message: "Enter OTP for verification" });
  // }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // await callVerifyOtpRoute(email, enteredOTP);
    // const otpVerified = await OTP.findOne({ email });
    // if (!otpVerified) {
    //   return res.status(400).json({ message: "OTP verification required before signup" });
    // }

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

// Login Route (using email)
const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  // Validate email format (optional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Email is not valid",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const passwordCheck = await user.comparePassword(password);
    if (!passwordCheck) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(user?._id);
    console.log(accessToken, refreshToken);
    if (!accessToken || !refreshToken) {
      return res.status(400).json({
        message: "Error during generating Tokens",
      });
    }
    const loginUser = await User.findById(user._id).select("-password -refreshToken");

    res.cookie("accessToken", accessToken, {
      maxAge: 3600000, // 1 hour
      httpOnly: true,
      secure: false,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 3600000,
      httpOnly: true,
    });
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
  const { search } = req.body;
  if (!search) {
    return res.status(400).json({ message: "Search field is empty" });
  }
  
  try {
    
    const users = await User.find({}).select("-password -refreshToken");
    
    // Configure Fuse.js options
    const fuseOptions = {
      keys: ["name", "email"],
      threshold: 0.3, // Lower threshold means stricter matching; adjust as needed
    };
    const fuse = new Fuse(users, fuseOptions);
    
    // Perform fuzzy search on the users array
    const results = fuse.search(search).map(result => result.item);
    
    return res.status(200).json({
      users: results,
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

 

export { SignUp, Login, getUser, sendOTPRoute, verifyOTPRoute,logout ,searchUserFuzzy, searchMyChat};
