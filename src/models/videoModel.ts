import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
    _id?: string;
    index: number;
    id: string;
    playlistItemId: string;
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
}

const VideoSchema: Schema = new Schema({
    index: { type: Number, required: true },
    id: { type: String, required: true },
    playlistItemId: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    channelId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const Video = mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
