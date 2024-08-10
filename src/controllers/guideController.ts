import { Request, Response } from 'express';
import mongoose, { ClientSession } from 'mongoose';
import Guide, { IGuide } from '../models/guideModel';
import Playlist from '../models/playlistModel';
import Video, { IVideo } from '../models/videoModel';
import User, { IUser } from '../models/userModel';
import { privacyStatus } from '../models/privacyStatusEnum';
import { addGuidToCompany, fetchAllCompanies, getCompanyByName, ICompanyResponse, isUserInCompany, validateUserAdminInCompany } from './companyController';
import { startTransaction, abortTransaction, commitTransaction, handleTransactionError } from './transactionsHandler';

export const handleGuideSaving = async (req: Request, res: Response) => {
    const { guideData, playlistData, videoData, companyName } = req.body;
    const session: ClientSession = await startTransaction();

    try {
        const currentUser = await findUser(req.body.user, res, session);
        if (!currentUser) return; // findUser sends the response if the user is not found

        const company = await validateUserAdminInCompany(companyName, currentUser._id, session, res);
        if (!company) return; // validateUserInCompany sends the response if the user is not in the company's users list

        const videoIds = await saveVideos(videoData, session);
        const savedPlaylist = await savePlaylist(playlistData, session);
        const savedGuide = await saveGuide(guideData, savedPlaylist._id, videoIds, currentUser._id, session);

        await associateGuideWithCompany(companyName, savedGuide._id, session);

        await commitTransaction(session);
        return res.status(201).send("Success");
    } catch (error) {
        await handleTransactionError(session, error, res);
    }
}

async function findUser(userId: string, res: Response, session?: ClientSession): Promise<IUser | null> {
    if (!userId) {
        if (session) await abortTransaction(session);
        res.status(401).send("Missing fields");
        return null;
    }

    const currentUser = await User.findById(userId).session(session || null);

    if (!currentUser) {
        if (session) await abortTransaction(session);
        res.status(404).send("Logged in user doesn't exist");
        return null;
    }

    return currentUser;
}

async function saveVideos(videoData: IVideo[], session: ClientSession): Promise<string[]> {
    const videoIds: string[] = [];
    for (const video of videoData) {
        const newVideo = new Video(video);
        const savedVideo = await newVideo.save({ session });
        videoIds.push(savedVideo._id.toString());
    }
    return videoIds;
}

async function savePlaylist(playlistData: any, session: ClientSession) {
    const newPlaylist = new Playlist(playlistData);
    return await newPlaylist.save({ session });
}

async function saveGuide(
    guideData: any,
    playlistId: mongoose.Types.ObjectId,
    videoIds: string[],
    uploaderId: mongoose.Types.ObjectId,
    session: ClientSession
) {
    const newGuide = new Guide({
        ...guideData,
        playlist: playlistId,
        videos: videoIds,
        uploader: uploaderId,
    });

    return await newGuide.save({ session });
}

async function associateGuideWithCompany(companyName: string, guideId: string, session: ClientSession) {
    await addGuidToCompany(companyName, guideId, session);
}

const filterCompanyGuidesForUser = async (company: ICompanyResponse, userId: mongoose.Types.ObjectId): Promise<IGuide[]> => {
    const userGuides: IGuide[] = [];
    const userInCompany = await isUserInCompany(company.name, userId);

    // If the user is in the company, add all guides
    if (userInCompany) {
        userGuides.push(...company.guides);
    } else {
        // If the user is not in the company, add only public guides
        const publicGuides = company.guides.filter(guide => guide.privacyStatus === privacyStatus.PUBLIC);
        userGuides.push(...publicGuides);
    }
    return userGuides;
}

export const getAllGuidesForUser = async (req: Request, res: Response): Promise<IGuide[]> => {
    const { user } = req.body;
    const currentUser = await findUser(user, res);
    if (!currentUser) return [];
    try {
        const allCompanies: ICompanyResponse[] = await fetchAllCompanies();
        const finalUserGuidesList: IGuide[] = [];

        for (const company of allCompanies) {
            const guides: IGuide[] = await filterCompanyGuidesForUser(company, user._id)
            finalUserGuidesList.push(...guides)
        }

        if (finalUserGuidesList.length === 0) {
            res.status(404).send(`No guides available for the user ${currentUser.fullName}.`);
            return [];
        }

        res.status(200).json({ guides: finalUserGuidesList });
        return finalUserGuidesList;
    } catch (error) {
        res.status(500).send(error)
        return []
    }
}

export const getCompanyGuidesForUser = async (req: Request, res: Response): Promise<IGuide[]> => {
    const { user, companyName } = req.body;
    const currentUser = await findUser(user, res);
    if (!currentUser) return [];
    try {
        const currCompany: ICompanyResponse | null = await getCompanyByName(companyName);
        if (!currCompany) {
            res.status(404).send("Company is not found");
            return [];
        }
        const userGuidesList: IGuide[] = await filterCompanyGuidesForUser(currCompany, user._id);
        if (userGuidesList.length === 0) {
            res.status(404).send(`No guides available for the user ${currentUser.fullName} on company ${companyName}.`);
            return [];
        }
        res.status(200).json({ guides: userGuidesList });
        return userGuidesList;
    } catch (error) {
        res.status(500).send(error)
        return []
    }

};


