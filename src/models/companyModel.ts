import mongoose, { Schema, Document } from 'mongoose';
import Guid from './guideModel'; 

interface ICompany extends Document {
    creator: mongoose.Types.ObjectId;
    name: string;
    users: mongoose.Types.ObjectId[];
    admin: mongoose.Types.ObjectId[];
    guids: mongoose.Types.ObjectId[]; // Array of ObjectIds referencing Guid
}

const companySchema = new Schema<ICompany>({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    admin: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    guids: [{ type: Schema.Types.ObjectId, ref: 'Guid', default: [] }] // Reference to Guid model
});

const Company = mongoose.model<ICompany>('Company', companySchema);
export default Company;
