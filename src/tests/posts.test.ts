// api.test.ts

import request from "supertest";
import app, {server} from "../app";
import {closeDB} from "../db/db";

let accessToken = "";

beforeAll(async () => {
    const loginResponse = await request(app).post("/auth/login").send({
        username: "testUser",
        password: "testPassword",
    });

    accessToken = loginResponse.body.accessToken;
});

describe("API Tests", () => {
    let createdPostId = "";

    it("should create a new post", async () => {
        const response = await request(app)
            .post("/post/createPost")
            .set({authorization: "JWT " + accessToken})
            .field("name", "Test Post")
            .field("creatorUserId", "user123")
            .field("creatorName", "Test User")
            .attach("picture", "public/images/default-user-profile.jpg")
            .attach("gameFile", "public/images/default-user-profile.jpg");

        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty("name", "Test Post");
        console.log(createdPostId);

        createdPostId = response.body._id;
    });

    it("should update the name of an existing post", async () => {
        const response = await request(app)
            .put(`/post/update/${createdPostId}`)
            .set({authorization: "JWT " + accessToken})
            .send({name: "Updated Post Name"});

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty("name", "Updated Post Name");
    });

    it("should get all posts", async () => {
        const response = await request(app)
            .get("/post/getAllPosts")
            .set({authorization: "JWT " + accessToken});

        expect(response.statusCode).toEqual(200);
    });

    it("should delete an existing post", async () => {
        const response = await request(app)
            .delete(`/post/delete/${createdPostId}`)
            .set({authorization: "JWT " + accessToken});

        expect(response.statusCode).toEqual(200);
    });
});

afterAll(async () => {
    try {
        await closeDB();
    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        server.close();
    }
});
