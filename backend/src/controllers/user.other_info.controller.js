import { FriendRequest } from "../models/request.model.js";

const getMyRequests = async (req, res) => {
    try {
        console.log("started")
        const userId = req.user?._id;
        console.log(userId)
        // Validate user authentication
        if (!userId) {
            return res.status(401).json({ // 401 Unauthorized is more appropriate
                success: false,
                message: "User is not authorized"
            });
        }

        // Fetch requests with proper async/await and population
        const requests = await FriendRequest.find({ receiver: userId })
            .sort({ createdAt: -1 }); // Sort by latest first
        console.log(requests)
        return res.status(200).json({
            success: true,
            message: "Requests fetched successfully",
            data: { // Standardized response structure
                count: requests.length,
                requests
            }
        });

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



const getsendRequests = async (req, res) => {
    try {
        console.log("started")
        const userId = req.user?._id;
        console.log(userId)
        // Validate user authentication
        if (!userId) {
            return res.status(401).json({ // 401 Unauthorized is more appropriate
                success: false,
                message: "User is not authorized"
            });
        }

        // Fetch requests with proper async/await and population
        const requests = await FriendRequest.find({ receiver: userId })
            .sort({ createdAt: -1 }); // Sort by latest first
        console.log(requests)
        return res.status(200).json({
            success: true,
            message: "Requests fetched successfully",
            data: { // Standardized response structure
                count: requests.length,
                requests
            }
        });

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


export {
     getMyRequests,
     getsendRequests
    };