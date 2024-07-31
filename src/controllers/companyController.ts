// companyController.ts
import Company from "../models/companyModule";
import { Request, Response } from "express";


// Create Company
export const createCompany = async (req: Request, res: Response) => {
    try {
        
        const { name, users, admin, videos } = req.body;
        const creator = req.body.user; // Assuming authenticate middleware adds the user object to req
        
        const newCompany = new Company({
            creator,
            name,
            users,
            admin,
            videos
        });

        await newCompany.save();

        res.status(201).json({ company: newCompany });
    } catch (error) {
        console.error("Error creating company in the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update Company
export const updateCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, name, users, admin, videos } = req.body;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { $set: { name, users, admin, videos } },
            { new: true }
        );

        if (!updatedCompany) {
            console.error("Company not found");
            return res.status(404).json({ error: "Company not found" });
        }

        console.log("Company updated successfully");
        res.status(200).json({ company: updatedCompany });
    } catch (error) {
        console.error("Error updating company in the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Company by ID
export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;

        // Retrieve company from the database by companyId
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Return relevant company information
        res.status(200).send({ companyData: company });
    } catch (error) {
        console.error("Error fetching company by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add User to Company
export const addUserToCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, userId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.users.push(userId);
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error adding user to company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Remove User from Company
export const removeUserFromCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, userId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.users = company.users.filter(user => user !== userId);
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error removing user from company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add Admin to Company
export const addAdminToCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, adminId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.admin.push(adminId);
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error adding admin to company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Remove Admin from Company
export const removeAdminFromCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, adminId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.admin = company.admin.filter(admin => admin !== adminId);
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error removing admin from company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add Video to Company
export const addVideoToCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, videoId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.videos.push(videoId);
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error adding video to company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Remove Video from Company
export const removeVideoFromCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, videoId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.videos = company.videos.filter(video => video !== videoId);
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error removing video from company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
