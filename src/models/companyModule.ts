import mongoose, { Document, Schema } from "mongoose";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateCompanyInput:
 *      type: object
 *      required:
 *        - name
 *        - users
 *        - admin
 *        - videos
 *      properties:
 *        name:
 *          type: string
 *          default: My Company
 *        users:
 *          type: array
 *          items:
 *            type: string
 *          default: []
 *        admin:
 *          type: array
 *          items:
 *            type: string
 *          default: []
 *        videos:
 *          type: array
 *          items:
 *            type: string
 *          default: []
 *    CreateCompanyResponse:
 *      type: object
 *      properties:
 *        creator:
 *          type: string
 *          description: ID of the user who created the company
 *        name:
 *          type: string
 *        users:
 *          type: array
 *          items:
 *            type: string
 *        admin:
 *          type: array
 *          items:
 *            type: string
 *        videos:
 *          type: array
 *          items:
 *            type: string
 */

export interface ICompany extends Document {
    creator: string;
    name: string;
    users: string[];
    admin: string[];
    videos: string[];
}

const companySchema = new Schema<ICompany>({
    creator: { type: String, required: true },
    name: { type: String, required: true },
    users: { type: [String], required: true },
    admin: { type: [String], required: true },
    videos: { type: [String], required: true },
});

const Company = mongoose.model<ICompany>("Company", companySchema);

export default Company;
