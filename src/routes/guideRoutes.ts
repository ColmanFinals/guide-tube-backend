import express, { Router } from 'express';
import authenticate from '../middleware/auth';
import {getAllGuidesForUser,getCompanyGuidesForUser,handleGuideSaving} from '../controllers/guideController';


const router: Router = express.Router();

/**
 * @openapi
 * /guide:
 *  post:
 *     tags:
 *     - Guide
 *     description: Creates a new guide
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               guideData:
 *                 type: object
 *                 properties:
 *                   privacyStatus:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   name:
 *                     type: string
 *                   views:
 *                     type: number
 *                 required:
 *                   - name
 *                   - views
 *                   - privacyStatus
 *               playlistData:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   publishedAt:
 *                     type: string
 *                     format: date-time
 *                   channelId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                 required:
 *                   - id
 *                   - publishedAt
 *                   - channelId
 *                   - title
 *                   - description
 *               videoData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     index:
 *                       type: number
 *                     id:
 *                       type: string
 *                     playlistItemId:
 *                       type: string
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                     channelId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                 required:
 *                   - index
 *                   - id
 *                   - playlistItemId
 *                   - publishedAt
 *                   - channelId
 *                   - title
 *                   - description
 *     responses:
 *       201:
 *         description: success  
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User doesn't exist
 *       500:
 *         description: Failed to save guide
 */
router.post('/', authenticate, (req, res) => handleGuideSaving(req, res));

/**
 * @swagger
 * /guide:
 *   get:
 *     summary: Get guides for a user based on company membership
 *     description: Returns all guides for a user if they are a member of a company. If the user is not a member of the company, only public guides will be returned.
 *     tags:
 *       - Guide
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of guides the user has access to
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the guide
 *                       name:
 *                         type: string
 *                         description: The name of the guide
 *                       privacyStatus:
 *                         type: string
 *                         description: The privacy status of the guide
 *                         enum: [public, unlisted]
 *                       uploader:
 *                         type: string
 *                         description: The ID of the user who uploaded the guide
 *                       playlist:
 *                         type: string
 *                         description: The ID of the playlist to which the guide belongs
 *                       views:
 *                         type: number
 *                         description: The number of views for the guide
 *       404:
 *         description: No guides available for the user.
 *       401:
 *         description: Missing or invalid authentication.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authenticate, getAllGuidesForUser)

/**
 * @swagger
 * /guide/byCompany:
 *   post:
 *     summary: Get guides for a user based on company membership, for a specific company
 *     description: Returns all guides of a specific company for a user. If the user is not a member of the company, only public guides will be returned.
 *     tags:
 *       - Guide
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: The name of the company
 *     responses:
 *       200:
 *         description: A list of guides the user has access to
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the guide
 *                       name:
 *                         type: string
 *                         description: The name of the guide
 *                       privacyStatus:
 *                         type: string
 *                         description: The privacy status of the guide
 *                         enum: [public, unlisted]
 *                       uploader:
 *                         type: string
 *                         description: The ID of the user who uploaded the guide
 *                       playlist:
 *                         type: string
 *                         description: The ID of the playlist to which the guide belongs
 *                       views:
 *                         type: number
 *                         description: The number of views for the guide
 *       404:
 *         description: No guides available for the user.
 *       401:
 *         description: Missing or invalid authentication.
 *       500:
 *         description: Internal server error.
 */
router.post('/byCompany', authenticate, getCompanyGuidesForUser);


export default router;
