// import files
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
// import generateOTP from "../utils/otpGenerator.utils.js";
import sendOTP from "../utils/optSend.utils.js";

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

export { SignUp, Login, getUser, sendOTPRoute, verifyOTPRoute };
