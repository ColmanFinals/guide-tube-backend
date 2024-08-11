import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
    creator: mongoose.Types.ObjectId;
    name: string;
    users: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    guides: mongoose.Types.ObjectId[]; 
}

const companySchema = new Schema<ICompany>({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, unique: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    guides: [{ type: Schema.Types.ObjectId, ref: 'Guide', default: [] }] 
});

const Company = mongoose.model<ICompany>('Company', companySchema);
export default Company;
