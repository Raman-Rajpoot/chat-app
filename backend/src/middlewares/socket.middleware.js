import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const socketAuthMiddleware = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Token:", token);
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Wait for the user to be fetched from the database
      const user = await User.findById(decoded._id).select("-password -refreshToken");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user; 
      console.log("User authenticated:", socket.user);
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });
};

export default socketAuthMiddleware;
