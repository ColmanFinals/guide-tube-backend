import mongoose from 'mongoose';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import * as guideController from '../controllers/guideController';
import Company, { ICompany } from '../models/companyModel';
import User, { IUser } from '../models/userModel';
import { Request, Response } from 'express';
import Guide, { IGuide } from '../models/guideModel';
import Video from '../models/videoModel';
import Playlist from '../models/playlistModel';

interface MockRequestOptions {
    params?: any;
    body?: any;
    user?: any;
}

const mockRequest = (options: MockRequestOptions = {}): Partial<Request> => {
    return {
        params: options.params || {},
        body: options.body || {},
        user: options.user || { _id: new mongoose.Types.ObjectId().toString() },
        get: jest.fn((name: string) => {
            return undefined;
        }),
        header: jest.fn((name: string) => {
            return undefined;
        }),
        accepts: jest.fn(),
        acceptsCharsets: jest.fn(),
    } as Partial<Request>;
};

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res); 
    res.send = jest.fn().mockReturnValue(res);
    return res as Partial<Response>;
  };

const demoUser = {
    _id: new mongoose.Types.ObjectId('66b63b9147edcc1180ea5d06'),  // Explicitly setting the ID for testing purposes
    fullName: "demoUser",
    username: "demoUsername",
    password: "password123",
    email: "demo@example.com"
};

describe('Company Controller Tests', () => {
    let mongoServer: MongoMemoryReplSet;
    let company: mongoose.Document<unknown, {}, ICompany> & ICompany & { _id: mongoose.Types.ObjectId; };
    let newGuideReq: { guideData: any; user?: { _id: mongoose.Types.ObjectId; }; companyName?: string; playlistData?: { id: string; publishedAt: string; channelId: string; title: string; description: string; }; videoData?: { index: number; id: string; playlistItemId: string; publishedAt: string; channelId: string; title: string; description: string; }[]; };
    let req: Partial<Request>;
    let res: Partial<Response>;

    const setupPublicAndPrivateGuidesAndUsers = async () => {
        let userWithoutAccess = await User.create({ fullName: "User Without Access", username: "usernoaccess", password: "password123", email: "usernoaccess@example.com" });
        let userWithAccess = await User.create({ fullName: "User With Access", username: "useraccess", password: "password123", email: "useraccess@example.com" });
    
        company = await Company.create({
            name: 'Access Controlled Co',
            logo: 'logo.png',
            creator: demoUser._id,
            users: [userWithAccess._id],
            admins: [demoUser._id],
            guides: []
        });
    
        // Ensure you have a playlist and uploader ID. Assuming `demoUser._id` can be used as uploader
        let publicGuide = await Guide.create({
            title: "Public Guide", 
            privacyStatus: "public", 
            company: company._id,
            playlist: new mongoose.Types.ObjectId('66b63b9147edcc1180ea5d08'),  
            uploader: demoUser._id,
            views: 0,
            name: "Public Guide Name"
        });
        let unlistedGuide = await Guide.create({
            title: "Unlisted Guide", 
            privacyStatus: "unlisted", 
            company: company._id,
            playlist: new mongoose.Types.ObjectId('66b63b9147edcc1180ea5d09'),
            uploader: demoUser._id,
            views: 0,
            name: "Unlisted Guide Name"
        });
    
        if (publicGuide._id && unlistedGuide._id) {
            company.guides.push(new mongoose.Types.ObjectId(publicGuide._id), new mongoose.Types.ObjectId(unlistedGuide._id));
            await company.save();
        }
    
        return { userWithAccess, userWithoutAccess, publicGuide, unlistedGuide };
    };
    
    const setupDatabase = async (isAdmin: boolean) => {
        const adminArray = isAdmin ? [demoUser._id] : [];
        company = await Company.create({
            name: 'test',
            logo: 'bla.png',
            creator: demoUser._id,
            users: [],
            admins: adminArray,
            guides: []
        });

        newGuideReq = {
            user: { _id: demoUser._id },
            companyName: company.name,
            guideData: {
                privacyStatus: "public",
                createdAt: "2024-08-24T12:28:28.358Z",
                name: "bla",
                views: 0
            },
            playlistData: {
                id: "123123",
                publishedAt: "2024-08-24T12:28:28.358Z",
                channelId: "1111",
                title: "blabla",
                description: "hihi"
            },
            videoData: [
                {
                    index: 0,
                    id: "12123",
                    playlistItemId: "1212112",
                    publishedAt: "2024-08-24T12:28:28.358Z",
                    channelId: "121212",
                    title: "121212",
                    description: "121212"
                }
            ]
        };

        req = { body: { ...newGuideReq } };
        res = mockResponse();
    };

    const runTest = async (expectedLength: number, expectedStatus: number) => {
        await guideController.handleGuideSaving(req as Request, res as Response);
        const playlistsAfterFun = await Playlist.find();
        const guidesAfterFun = await Guide.find();
        const videosAfterFun = await Video.find();

        expect(playlistsAfterFun.length).toBe(expectedLength);
        expect(guidesAfterFun.length).toBe(expectedLength);
        expect(videosAfterFun.length).toBe(expectedLength);
        expect(res.status).toHaveBeenCalledWith(expectedStatus);
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({
            replSet: {
                storageEngine: 'wiredTiger',
                name: 'rs0'
            }
        });

        await mongoServer.waitUntilRunning();

        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for a few seconds

        try {
            await mongoose.connection.db.admin().command({ replSetInitiate: undefined });
        } catch (error) {
            console.log('Replica set already initiated');
        }
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await mongoose.connection.dropDatabase();
        jest.clearAllMocks();
        await User.create(demoUser);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
        jest.restoreAllMocks();
    });

    it('should create guide when user is admin', async () => {
        await setupDatabase(true);
        await runTest(1, 201); // Expect 1 entity created and a 201 status
    });

    it('should not create guide when user is not an admin', async () => {
        await setupDatabase(false);
        await runTest(0, 403); // Expect 0 entities created and a 403 status
    });

    it('should associate a guide with a company successfully', async () => {
        await setupDatabase(true);
        await guideController.handleGuideSaving(req as Request, res as Response);
        const updatedCompany = await Company.findById(company._id).populate('guides');
        expect(updatedCompany?.guides.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return both public and unlisted guides for users with access', async () => {
        const { userWithAccess, userWithoutAccess, publicGuide, unlistedGuide } = await setupPublicAndPrivateGuidesAndUsers();
        jest.spyOn(Guide, 'populate').mockResolvedValueOnce({} as any);
        const req = { body: { user: userWithAccess }};
        const res = mockResponse();
        await guideController.getAllGuidesForUser(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          guides: expect.arrayContaining([
            expect.objectContaining({ _id: publicGuide._id }),
            expect.objectContaining({ _id: unlistedGuide._id })
          ])
        });
      });
      it('should return only public guides for users without access', async () => {
        const { userWithAccess, userWithoutAccess, publicGuide, unlistedGuide } = await setupPublicAndPrivateGuidesAndUsers();
        jest.spyOn(Guide, 'populate').mockResolvedValueOnce({} as any);
        const req = { body: { user: userWithoutAccess }};
        const res = mockResponse();
        const guide= await guideController.getAllGuidesForUser(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          guides: expect.arrayContaining([
            expect.objectContaining({ _id: publicGuide._id }),
          ])
        });
        expect(guide.length).toBe(1);
    });

})
