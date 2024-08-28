import * as fs from "fs";
import * as path from "path";
import User from '../models/userModel';
import { Request, Response } from "express";
import Company from "../models/companyModel";
import mongoose from "mongoose";
import { Language } from "../models/languageEnum";


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

        res.status(200).send(user);

    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        if (!users.length) {
            return res.status(404).json({ error: "No users found" });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const isAdmin = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user?._id;
        if (!userId) {
            return res.status(400).json({ error: "User ID not provided" });
        }

        const companies = await Company.find({});
        const isUserAdmin = companies.some(company =>
            company.admins.includes(new mongoose.Types.ObjectId(userId))
        );

        res.status(200).json({ isAdmin: isUserAdmin });
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateUserLanguage = async (req: Request, res: Response) => {
    try {
        const { language } = req.body;

        // Validate if the provided language is one of the supported enums
        if (!Object.values(Language).includes(language)) {
            console.log(`Invalid language provided: ${language}`)
            return res.status(400).json({ error: "Invalid language provided" });
        }

        const user = await User.findById(req.body.user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user's language
        user.language = language;
        await user.save();
        console.log(`User ${user.fullName} with id ${user._id} updated language to ${language} successfully!`)
        return res.status(200).json({ message: "User language updated successfully", user });

    } catch (error) {
        console.error("Error updating user language:", error);
        return res.status(500).json({ error: "An error occurred while updating user language" });
    }
};