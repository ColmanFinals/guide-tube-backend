import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylistStatus extends Document {
    privacyStatus: string;
}

export interface IPlaylist extends Document {
    id: string;
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    status: IPlaylistStatus;
}

const PlaylistStatusSchema: Schema = new Schema({
    privacyStatus: { type: String, required: true },
});

const PlaylistSchema: Schema = new Schema({
    id: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    channelId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: PlaylistStatusSchema, required: true },
});

const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);

export default Playlist;
