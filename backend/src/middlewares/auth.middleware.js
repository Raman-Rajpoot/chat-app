import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
dotenv.config();

const Authorization = async (req, res, next) => {
    try {
        console.log("🔹 Start Authorization Middleware");

        // Extract Token from Cookies or Authorization Header
        const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

        // If no token found, return 401 Unauthorized
        if (!accessToken) {
            return res.status(401).json({ message: "Access Token not found" });
        }

        // Check if ACCESS_TOKEN_SECRET is loaded
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("❌ ACCESS_TOKEN_SECRET is missing from environment variables!");
            return res.status(500).json({ message: "Server Error: Missing Token Secret" });
        }

        // Verify Token
        const userJWT = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        if (!userJWT?._id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const user = await User.findById(userJWT?._id).select("-password -refreshToken");
        req.user = user;
        next();

    } catch (err) {
        console.error("❌ Authorization Middleware Error:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export { Authorization };
