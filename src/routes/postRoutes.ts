import express from "express";
import authenticate from "../middleware/auth";
import * as postController from "../controllers/postController";
import * as fileController from "../controllers/fileController";

const router = express.Router();

/**
 * @openapi
 * /post/createPost:
 *  post:
 *    tags:
 *     - Post
 *    summary: Create a new post
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              creatorUserId:
 *                type: string
 *              creatorName:
 *                type: string
 *              picture:
 *                type: string
 *                format: binary
 *              gameFile:
 *                type: string
 *                format: binary
 *    responses:
 *      201:
 *        description: Post created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal Server Error
 */
router.post("/createPost", authenticate, fileController.uploadPostFiles, postController.createPost);

/**
 * @openapi
 * /post/getAllPosts:
 *  get:
 *    tags:
 *     - Post
 *    summary: Get all posts
 *    security:
 *    - bearerAuth: []
 *    responses:
 *      200:
 *        description: All posts retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal Server Error
 */
router.get("/getAllPosts", authenticate, postController.getAllPosts);

/**
 * @openapi
 * /post/update/{id}:
 *  put:
 *    tags:
 *     - Post
 *    summary: Update a post
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *    responses:
 *      200:
 *        description: Post updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Post not found
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal Server Error
 */
router.put("/update/:id", authenticate, postController.updatePost);

/**
 * @openapi
 * /post/delete/{id}:
 *  delete:
 *    tags:
 *     - Post
 *    summary: Delete a post
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Post deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Post not found
 *      500:
 *        description: Internal Server Error
 */
router.delete("/delete/:id", authenticate, postController.deletePost);

/**
 * @openapi
 * /post/getPost/{id}:
 *  get:
 *    tags:
 *     - Post
 *    summary: Get a post by ID
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Post retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Post not found
 *      500:
 *        description: Internal Server Error
 */
router.get("/getPost/:id", authenticate, postController.getPost);

/**
 * @openapi
 * /post/addComment:
 *  post:
 *    tags:
 *     - Comment
 *    summary: Add a comment to a post
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              text:
 *                type: string
 *              userId:
 *                type: string
 *              postId:
 *                type: string
 *    responses:
 *      200:
 *        description: Comment added successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Post not found
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal Server Error
 */
router.post("/addComment", authenticate, postController.addComment);

/**
 * @openapi
 * /post/getPostComments/{postId}:
 *  get:
 *    tags:
 *     - Comment
 *    summary: Get comments for a post
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: postId
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Comments retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Comment'  # Assuming a schema for Comment
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Post not found
 *      500:
 *        description: Internal Server Error
 */
router.get("/getPostComments/:postId", authenticate, postController.getPostComments);


export default router;
