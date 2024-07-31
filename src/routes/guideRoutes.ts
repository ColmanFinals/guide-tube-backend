import express, { Router } from 'express';
import authenticate from '../middleware/auth';
import GuideController from '../controllers/guideController';


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
 *                   status:
 *                     type: object
 *                     properties:
 *                       privacyStatus:
 *                         type: string
 *                 required:
 *                   - id
 *                   - publishedAt
 *                   - channelId
 *                   - title
 *                   - description
 *                   - status
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
router.post('/', authenticate, (req, res) => GuideController.saveGuide(req, res));

export default router;
