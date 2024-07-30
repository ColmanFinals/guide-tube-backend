import Company from "../models/companyModel";
import { Request, Response } from "express";
import mongoose from "mongoose";

// Create Company
export const createCompany = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const creator = req.body.user; // Assuming authenticate middleware adds the user object to req
        
        const newCompany = new Company({
            creator: new mongoose.Types.ObjectId(creator._id), // Reference to User collection
            name,
            users: [],
            admin: [],
            guids: []
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
        const { companyId, name, users, admin, guids } = req.body;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                $set: {
                    name,
                    users: users.map((user: string) => new mongoose.Types.ObjectId(user)),
                    admin: admin.map((admin: string) => new mongoose.Types.ObjectId(admin)),
                    guids: guids.map((guid: string) => new mongoose.Types.ObjectId(guid))
                }
            },
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

// Get all companies
export const getAllCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await Company.find().populate('creator users admin guids'); // Fetch all companies and populate references
        res.status(200).json({ companies });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Company by ID
export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;

        // Retrieve company from the database by companyId
        const company = await Company.findById(companyId).populate('creator users admin guids');

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

        company.users.push(new mongoose.Types.ObjectId(userId));
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

        company.users = company.users.filter(user => !user.equals(userId));
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

        company.admin.push(new mongoose.Types.ObjectId(adminId));
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

        company.admin = company.admin.filter(admin => !admin.equals(adminId));
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error removing admin from company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add GUID to Company
export const addGuidToCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, guidId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.guids.push(new mongoose.Types.ObjectId(guidId));
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error adding GUID to company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Remove GUID from Company
export const removeGuidFromCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, guidId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        company.guids = company.guids.filter(guid => !guid.equals(guidId));
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error removing GUID from company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete a company by ID
export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params; // Get companyId from URL parameters

        // Ensure the companyId is provided
        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        // Find and delete the company
        const result = await Company.findByIdAndDelete(companyId);

        // Check if the company was found and deleted
        if (!result) {
            return res.status(404).json({ error: "Company not found" });
        }

        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        console.error("Error deleting company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
