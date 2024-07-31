import { NextFunction, Request, Response } from "express";
import User from "../models/userModule"; // Adjust path as necessary

const checkSystemRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Retrieve user ID from the request body (you may need to adjust this based on your setup)
        const userId = req.body.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID not provided" });
        }

        // Fetch user from the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        
        if (user.role === "system") {
            return next(); // User has the "system" role, proceed to the route
        }

        // If user is not authorized, respond with a 403 Forbidden status
        return res.status(403).json({ error: "Forbidden: Insufficient role" });
    } catch (error) {
        console.error("Error checking user role:", error);
        return res.sendStatus(500); // Internal Server Error
    }
};

export default checkSystemRole;
