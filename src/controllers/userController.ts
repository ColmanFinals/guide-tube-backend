// userController.ts

import * as fs from "fs";
import * as path from "path";
import User from "../models/userModule";
import {Request, Response} from "express";


export const updateUserPicture = async (req: Request, res: Response) => {
    try {
        // Retrieve the current user's data to get the old picture path
        const {userId} = req.body;
        const pictureName = req.file?.filename;
        // Construct the file paths
        const picturePath = `images/${pictureName}`;
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            console.error("User not found");
            return;
        }

        const oldPicturePath = path.join("public", currentUser.picture);

        // Delete the old file from the server
        if (
            oldPicturePath &&
            !oldPicturePath.includes("default-user-profile.jpg")
        ) {
            try {
                fs.unlink(oldPicturePath, (deleteError) => {
                    if (deleteError) {
                        console.error("Error deleting old file:", deleteError);
                    } else {
                        console.log("Old file deleted successfully");
                    }
                });
            } catch (deleteError) {
                console.error("Error deleting old file:", deleteError);
            }
        }

        // Update the user's picture path in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$set: {picture: picturePath}},
            {new: true}
        );

        if (!updatedUser) {
            console.error("User not found");
        } else {
            console.log("User picture updated successfully");
        }

        res.status(201).json({filePath: picturePath});
    } catch (error) {
        console.error("Error updating user picture in the database:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;

        // Retrieve user from the database by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        // Return relevant user information

        res.status(200).send({userData: user});

    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
