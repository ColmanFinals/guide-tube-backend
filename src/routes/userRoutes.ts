import express from "express";
import * as userController from "../controllers/userController";
import authenticate from "../middleware/auth";
import {uploadFile} from "../controllers/fileController";

const router = express.Router();

/**
 * @openapi
 * /user/updatePicture:
 *  put:
 *    tags:
 *     - User
 *    summary: Update user profile picture
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: string
 *              file:
 *                type: string
 *                format: binary
 *    responses:
 *      201:
 *        description: User picture updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                filePath:
 *                  type: string
 *      401:
 *        description: Unauthorized
 *      400:
 *        description: Bad request
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/updatePicture", authenticate, uploadFile, userController.updateUserPicture);

/**
 * @openapi
 * /user/getUserData/{userId}:
 *  get:
 *    tags:
 *     - User
 *    summary: Get user data by ID
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: User data retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userData:
 *                  $ref: '#/components/schemas/User'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.get("/getUserData/:userId", authenticate, userController.getUserById);

export default router;
