// userController.ts

import * as fs from "fs";
import * as path from "path";
import User from '../models/userModel';
import { Request, Response } from "express";
import Company from "../models/companyModel";
import mongoose from "mongoose";


export const updateUserPicture = async (req: Request, res: Response) => {
    try {
        // Retrieve the current user's data to get the old picture path
        const { userId } = req.body;
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
            { $set: { picture: picturePath } },
            { new: true }
        );

        if (!updatedUser) {
            console.error("User not found");
        } else {
            console.log("User picture updated successfully");
        }

        res.status(201).json({ filePath: picturePath });
    } catch (error) {
        console.error("Error updating user picture in the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;

        // Retrieve user from the database by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return relevant user information

        res.status(200).send({ userData: user });

    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchAllUsers = async (req: Request, res: Response) => {
    try {
        // Retrieve all users from the database
        const users = await User.find({});

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        // Return relevant user information
        res.status(200).send({ usersData: users });

    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Is user Admin
export const isAdmin = async (req: Request, res: Response) => {
    try {
        const userId = req.body["user"]["_doc"]["_id"]
        // Retrieve all users from the database
        const companies = await Company.find({});
        
        const isUserAdmin = companies.some(company => company.admin.includes(new mongoose.Types.ObjectId(userId)));

        // Return relevant user information
        if (isUserAdmin) {
            res.status(200).send({ isAdmin: true });
        } else {
            res.status(200).send({ isAdmin: false });
        }

    } catch (error) {
        console.error("Error finding if a user is admin:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
