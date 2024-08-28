import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Request, Response } from 'express';
import { signup, login, googleLogin, logout, refreshToken, changePassword } from '../controllers/authControllers';
import User from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from "jsonwebtoken";

describe('AuthController Tests', () => {
    let mongoServer: MongoMemoryServer;
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await mongoose.connection.dropDatabase();
        jest.clearAllMocks();
      });
    
      afterEach(async () => {
        await mongoose.connection.dropDatabase();
        jest.restoreAllMocks();
      });

    test('signup - should create a new user', async () => {
        let reqMock: Partial<Request> = {
            body: {
                username: 'testuser',
                password: 'testpass',
                fullName: 'Test User'
            }
        }
        let resMock: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis() 
        };

        await signup(reqMock as Request, resMock as Response);

        const user = await User.findOne({ username: 'testuser' });
        expect(user).not.toBeNull();
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(user?.username).toEqual('testuser');
    });

    test('login - should authenticate user and return tokens', async () => {
        const password = await bcrypt.hash('testpass', 10);
        await new User({
            username: 'testlogin',
            password: password,
            fullName: 'Test Login'
        }).save();

        let reqMock: Partial<Request> = {
            body: {
                username: 'testlogin',
                password: 'testpass'
            }
        }
        let resMock: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await login(reqMock as Request, resMock as Response);
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.send).toHaveBeenCalledWith(expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            userData: expect.any(Object)
        }));
    });
    test('login with wrong password- not authenticated', async () => {
        const password = await bcrypt.hash('testpass', 10);
        await new User({
            username: 'testlogin',
            password: password,
            fullName: 'Test Login'
        }).save();

        let reqMock: Partial<Request> = {
            body: {
                username: 'testlogin',
                password: 'testpass2'
            }
        }
        let resMock: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await login(reqMock as Request, resMock as Response);
        expect(resMock.status).toHaveBeenCalledWith(401);
    });
    test('googleLogin - should handle first-time and returning users', async () => {
        let reqMock: Partial<Request> = {
            body: {
                credentials: {
                    email: 'testgoogle@test.com',
                    name: 'Google User'
                }
            }
        }
        let resMock: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        await googleLogin(reqMock as Request, resMock as Response);
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.send).toHaveBeenCalledWith(expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            userData: expect.any(Object)
        }));
    });


    test('changePassword - should update user password', async () => {
        const oldPassword = 'oldPassword';
        const newPassword = 'newPassword';
        const hashedPassword = await bcrypt.hash(oldPassword, 10);
        const user = await new User({
            username: 'passwordtest',
            fullName: 'Test Login',
            password: hashedPassword
        }).save();

        let reqMock: Partial<Request> = {
            body: {
                currentPassword: oldPassword,
                newPassword: newPassword,
                user: {_id: user._id}
            }
        }
        let resMock: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await changePassword(reqMock as Request, resMock as Response);
        const updatedUser = await User.findById(user._id);
        if(updatedUser){
            const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
            expect(isMatch).toBeTruthy();
        }
        

        expect(updatedUser).not.toBeNull()
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.send).toHaveBeenCalledWith({ message: "updated password successfully" });
    });
});
