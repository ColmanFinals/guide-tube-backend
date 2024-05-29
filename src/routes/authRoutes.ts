import express, {Router} from 'express';
import authenticate from '../middleware/auth';
import * as authController from '../controllers/authControllers';

const router: Router = express.Router();


/**
 * @openapi
 * /auth/healthcheck:
 *  get:
 *     tags:
 *     - Healthcheck
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
router.get('/healthcheck', (req, res) => res.sendStatus(200));

/**
 * @openapi
 * /auth/signup:
 *  post:
 *     tags:
 *     - Authentication
 *     summary: Register a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserResponse'
 *      409:
 *        description: Conflict
 *      400:
 *        description: Bad request
 */
router.post('/signup', authController.signup);

/**
 * @openapi
 * /auth/login:
 *  post:
 *     tags:
 *     - Authentication
 *     summary: Login a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/LoginUserInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginUserResponse'
 *      409:
 *        description: Conflict
 *      400:
 *        description: Bad request
 */
router.post('/login', authController.login);

router.post('/googleLogin', authController.googleLogin);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout a user
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Logged out successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @openapi
 * /auth/refreshToken:
 *  post:
 *    tags:
 *     - Authentication
 *    summary: Refresh access token
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *    responses:
 *      200:
 *        description: Tokens refreshed successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."
 *                refreshToken:
 *                  type: string
 *                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */
router.post('/refreshToken', authController.refreshToken);


export default router;
