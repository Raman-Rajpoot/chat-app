import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
dotenv.config();

const Authorization = async (req, res, next) => {
  try {
    console.log("🔹 Start Authorization Middleware");

    // Get token from Authorization header (Bearer token format)
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token not found in headers" });
    }
    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    
    // Rest of your existing code remains the same...
    console.log("Extracted Token:", token);
    
    if (!token) {
      return res.status(401).json({ message: "Access token not found" });
    }

    // Ensure the secret is available
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.error("❌ ACCESS_TOKEN_SECRET is missing from environment variables!");
      return res.status(500).json({ message: "Server Error: Missing Token Secret" });
    }

    // Verify token and handle errors if token is invalid or expired.
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    // Ensure that the token payload has a user ID
    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // Retrieve the user from the database (exclude sensitive fields)
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // Attach the user to the request object for later middleware/routes
    req.user = user;
    next();

  } catch (err) {
    console.error("❌ Authorization Middleware Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { Authorization };
