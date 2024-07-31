import mongoose, { Schema, Document } from 'mongoose';
import { IPlaylist } from './playlistModel';
import { IVideo } from './videoModel';
import { IUser } from './userModel';

interface IGuide extends Document {
    _id?: string;
    createdAt: Date;
    name: string;
    views: number;
    privacyStatus: string;
    uploader: mongoose.Types.ObjectId | IUser;
    playlist: mongoose.Types.ObjectId | IPlaylist;
    videos: mongoose.Types.ObjectId[] | IVideo[];
}

const GuideSchema: Schema = new Schema({
    createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true },
    views: { type: Number, required: true },
    privacyStatus: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true }],
});

const Guide = mongoose.model<IGuide>('Guide', GuideSchema);

export default Guide;
