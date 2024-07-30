import { Request, Response } from 'express';
import Guide from '../models/guideModel';
import Playlist from '../models/playlistModel';
import Video, { IVideo } from '../models/videoModel';
import User from '../models/userModel';

const saveGuide = async (req: Request, res: Response) => {
    const { guideData, playlistData, videoData } = req.body;

    try {

        const { userId } = req.body;
        if(!userId) {
            return res.status(401).send("missing fileds");
        }
        const currentUser = await User.findById(userId);
        if(!currentUser){
            return res.status(404).send("Logged in user doesn't exist");
        }
        // Save each video and collect their IDs
        const videoIds = await saveVideos(videoData);

        // Save the playlist and keep its ID
        const savedPlaylist = await savePlaylist(playlistData);

        // Save the guide with references to the playlist and video IDs
        const newGuide = new Guide({
            ...guideData,
            playlist: savedPlaylist._id,
            videos: videoIds,
            uploader: currentUser,
        });
        const savedGuide = await newGuide.save();

        return res.status(201).json(savedGuide);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to save guide', details: error });
    }
}

async function savePlaylist(playlistData: any) {
    const newPlaylist = new Playlist(playlistData);
    const savedPlaylist = await newPlaylist.save();
    return savedPlaylist;
}

async function saveVideos(videoData: IVideo[]): Promise<string[]> {
    const videoIds = [];
    for (const video of videoData) {
        const newVideo = new Video(video);
        const savedVideo = await newVideo.save();
        videoIds.push(savedVideo._id);
    }
    return videoIds;
}

export default {saveGuide};