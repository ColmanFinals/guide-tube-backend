// auth.test.ts

import request from "supertest";
import  {app,server} from "../app";

import {closeDB} from "../db/db";
import User from "../models/userModule";

const fullname = "estFudlName";
const userName = "estUserName";
const userPassword = "testUserPassword";

beforeAll(async () => {
    await User.deleteOne({username: userName});
});

describe("Sign Up", () => {
    it("Add new user", async () => {
        const res = await request(app).post("/auth/signup").send({
            username: userName,
            password: userPassword,
            fullName: fullname,
        });
        expect(res.statusCode).toEqual(200);
    });
});

//Log in test
let accessToken = "";
let refreshToken = "";
describe("Login", () => {
    it("Login user", async () => {
        const res = await request(app).post("/auth/login").send({
            username: userName,
            password: userPassword,
        });
        expect(res.statusCode).toEqual(200);
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;

        expect(accessToken).not.toEqual(undefined);
        expect(refreshToken).not.toEqual(undefined);
    });
});


let newAccessToken = "";
let newRefreshToken = "";
jest.setTimeout(30000);
describe("Token access", () => {
    it("timeout access", async () => {
        await new Promise((r) => setTimeout(r, 3 * 1000));
        const res = await request(app)
            .get("/auth/dashboard")
            .set({authorization: "JWT " + accessToken});
        expect(res.statusCode).not.toEqual(200);
    });

    it("Refresh token", async () => {
        const res = await request(app)
            .get("/auth/refreshToken")
            .set({authorization: "JWT " + accessToken + " " + refreshToken});
        expect(res.statusCode).toEqual(200);
        newAccessToken = res.body.accessToken;
        newRefreshToken = res.body.refreshToken;
        expect(newAccessToken).not.toEqual(undefined);
        expect(newRefreshToken).not.toEqual(undefined);
    });
});

describe("Log out", () => {
    it("should logout with authentication", async () => {
        const response = await request(app)
            .post("/auth/logout")
            .set({
                authorization: "JWT " + newAccessToken + " " + newRefreshToken,
            });
        expect(response.statusCode).toEqual(200);
    });

    it("should not logout without authentication", async () => {
        const response = await request(app).post("/auth/logout").send();

        expect(response.status).toBe(401);
    });
});

afterAll(async () => {
    try {
        await User.deleteOne({username: userName});

        await closeDB();
    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        server.close();
    }
});
