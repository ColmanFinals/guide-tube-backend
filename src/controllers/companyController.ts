import Company from "../models/companyModel";
import { Request, Response } from "express";
import mongoose, { ClientSession, Types } from "mongoose";
import { abortTransaction } from "./transactionsHandler";
import User, { IUser } from "../models/userModel";
import { IGuide } from "../models/guideModel";

export interface ICompanyResponse extends Document {
    _id: string;
    creator: IUser;
    name: string;
    logo: string;
    users: (IUser)[];
    admins: (IUser)[];
    guides: (IGuide)[]; 
}

// Create Company
export const createCompany = async (req: Request, res: Response) => {
    try {
        const { name, logo } = req.body;
        const creator = req.body.user; // Assuming authenticate middleware adds the user object to req
        
        const newCompany = new Company({
            creator: new mongoose.Types.ObjectId(creator._id), // Reference to User collection
            name,
            logo,
            users: [],
            admins: [],
            guides: []
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
        const { companyId, name, logo, users, admin, guides } = req.body;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                $set: {
                    name,
                    logo,
                    users: users.map((user: string) => new mongoose.Types.ObjectId(user)),
                    admins: admin.map((admin: string) => new mongoose.Types.ObjectId(admin)),
                    guides: guides.map((guid: string) => new mongoose.Types.ObjectId(guid))
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

export const fetchAllCompanies = async (): Promise<ICompanyResponse[]> => {
    try {
        const companies: ICompanyResponse[] = await Company.find().populate('creator users admins guides').populate({
            path: 'guides',
            populate: {
                path: 'videos',
                model: 'Video'
            }
        });
;
        return companies;
    } catch (error) {
        console.error("Error fetching companies:", error);
        throw new Error("Failed to fetch companies");
    }
};

export const getAllCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await fetchAllCompanies();
        res.status(200).json({ companies });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export async function validateUserAdminInCompany(companyName: string, userId: mongoose.Types.ObjectId, session: ClientSession, res: Response) {
    const company = await Company.findOne({ name: companyName }).session(session);
    if (!company) {
        await abortTransaction(session);
        console.log(`Company ${companyName} not found`)
        res.status(404).send(`Company ${companyName} not found`);
        return null;
    }

    if (!company.admins.includes(userId)) {
        await abortTransaction(session);
        res.status(403).send(`User ${userId} is not an admin of company ${companyName} and cannot add guides`);
        return null;
    }

    return company;
}

export async function isUserInCompany(companyName: string, userId: mongoose.Types.ObjectId) : Promise<boolean>{
    const company = await Company.findOne({ name: companyName });
    if (!company) {
        return false;
    }
    return company.users.includes(userId) || company.admins.includes(userId)
}

// Get Company by ID
export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;

        // Retrieve company from the database by companyId
        const company = await Company.findById(companyId).populate('creator users admins guides');

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Return relevant company information
        res.status(200).send(company);
    } catch (error) {
        console.error("Error fetching company by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getCompanyByName = async (companyName: string): Promise<ICompanyResponse | null> => {
    try {

        // Retrieve company from the database by companyId
        const company: ICompanyResponse | null = await Company.findOne({ name: companyName }).populate('creator users admins guides').populate({
            path: 'guides',
            populate: {
                path: 'videos',
                model: 'Video'
            }
        });
;
        return company;
    } catch (error) {
        console.log(error)
        throw Error("Error while fetching company by name")
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

        const mongoUserID = new mongoose.Types.ObjectId(userId)

        if (company.admins.includes(mongoUserID)){
            company.admins = company.admins.filter(admin => !admin.equals(userId));
        }

        if (!company.users.includes(mongoUserID)){
            company.users.push(mongoUserID);
        }
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
        
        const { companyId, username } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const mongoAdminId = new mongoose.Types.ObjectId(user._id);

        if (company.users.includes(mongoAdminId)) {
            company.users = company.users.filter(user => !user.equals(user._id));
        }

        if (!company.admins.includes(mongoAdminId)) {
            company.admins.push(mongoAdminId);
        }
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

        company.admins = company.admins.filter(admin => !admin.equals(adminId));
        await company.save();

        res.status(200).json({ company });
    } catch (error) {
        console.error("Error removing admin from company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const addGuidToCompany = async (companyName: string, guideId: string, session: ClientSession) => {
    try {

        const company = await Company.findOne({"name": companyName});
        if (!company) {
            throw Error("Company doesn't exist")
        }

        company.guides.push(new mongoose.Types.ObjectId(guideId));
        await company.save({ session });
    } catch (error) {
        console.error("Error adding GUID to company:", error);
        throw Error("Internal Server Error: " + error );
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

        company.guides = company.guides.filter(guides => !guides.equals(guidId));
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

// Fetch My Companies as Admin
export const fetchMyCompanies = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user._id
        console.log(userId)
        const adminCompanies = await Company.find({ admins: { $in: [userId] } })
        console.log(adminCompanies)
        
        // Return the list of companies
        res.status(200).send(adminCompanies);

    } catch (error) {
        console.error("Error fetching my companies:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};