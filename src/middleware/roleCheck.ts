import { NextFunction, Request, Response } from "express";

const checkSystemRole = (req: Request, res: Response, next: NextFunction) => {
    try {
        let userRole = req.body.user._doc.role
        
        // Ensure the user is authenticated and has the role
        if (req.body.user && userRole === "system") {
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
