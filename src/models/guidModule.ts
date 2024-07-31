import mongoose, { Schema, Document } from 'mongoose';

interface IGuid extends Document {
    name: string;
    videos: string[]; // List of strings
}

const GuidSchema: Schema = new Schema({
    name: { type: String, required: true },
    videos: { type: [String], required: true } // List of strings
});

const Guid = mongoose.model<IGuid>('Guid', GuidSchema);
export default Guid;
