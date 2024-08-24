import { Request, Response } from 'express';
import { updateUserPicture, getUserById, fetchAllUsers, isAdmin, updateUserLanguage } from '../controllers/userController';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/userModel';

const demoUser = {
    _id: new mongoose.Types.ObjectId('66b63b9147edcc1180ea5d06'),  // Explicitly setting the ID for testing purposes
    fullName: "demoUser",
    username: "demoUsername",
    password: "password123",
    email: "demo@example.com"
};


// Mocking the Request type
const mockRequest = (options: {
    body?: any,
    params?: any,
    file?: any,
    sessionData?: any,
    userId?: string
}): Partial<Request> => {
    return {
        body: options.body,
        params: options.params,
        file: options.file,
        session: options.sessionData,
        user: { _id: options.userId }
    } as Partial<Request>;
};

// Mocking the Response type
const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};


describe('User Controller Tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGO_URI = mongoUri;
        await mongoose.connect(mongoUri);
        await User.create(demoUser);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('should update the user picture successfully', async () => {
        const req = mockRequest({
            body: { userId: '66b63b9147edcc1180ea5d06' },
            file: { filename: 'test.jpg' }
        });
        const res = mockResponse();

        await updateUserPicture(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            filePath: expect.any(String)
        }));
    });

    it('should retrieve user data with valid userId', async () => {
        const req = mockRequest({
            params: { userId: '66b63b9147edcc1180ea5d06' }
        });
        const res = mockResponse();

        await getUserById(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    });

    it('should fetch all users successfully', async () => {
        const req = mockRequest({});
        const res = mockResponse();

        await fetchAllUsers(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object)); // Customize this based on expected output
    });

    // Testing isAdmin
    it('should verify user admin status', async () => {
        const req = mockRequest({
            body: { user: { _id: demoUser._id.toString() } }
        });
        const res = mockResponse();

        await isAdmin(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            isAdmin: expect.any(Boolean) // Assuming boolean; adjust according to actual expected output
        }));
    });

    // Testing updateUserLanguage
    it('should update user language successfully', async () => {
        const req = mockRequest({
            body: { user: demoUser._id.toString(), language: 'en' }
        });
        const res = mockResponse();

        await updateUserLanguage(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "User language updated successfully"
        }));
    });

    // Testing error case for updateUserLanguage
    it('should return error if language is not valid', async () => {
        const req = mockRequest({
            body: { user: demoUser._id.toString(), language: 'invalid' }
        });
        const res = mockResponse();

        await updateUserLanguage(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: "Invalid language provided"
        }));
    });

    // Testing error case for isAdmin when user ID is not provided
    it('should return error when checking admin status without user ID', async () => {
        const req = mockRequest({ body: { user: {} } }); // Empty user object
        const res = mockResponse();

        await isAdmin(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: "User ID not provided"
        }));
    });
});

