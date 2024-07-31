import express from "express";
import * as companyController from "../controllers/companyController";
import authenticate from "../middleware/auth";
import checkSystemRole from "../middleware/roleCheck";

const router = express.Router();

/**
 * @openapi
 * /company/create:
 *  post:
 *    tags:
 *     - Company
 *    summary: Create a new company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateCompanyInput'
 *    responses:
 *      201:
 *        description: Company created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal Server Error
 */
router.post("/create", authenticate, checkSystemRole,companyController.createCompany);


/**
 * @openapi
 * /company/getAll:
 *  get:
 *    tags:
 *     - Company
 *    summary: Get all companies
 *    security:
 *    - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of all companies
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                companies:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal Server Error
 */
router.get("/getAll", authenticate, checkSystemRole, companyController.getAllCompanies);


/**
 * @openapi
 * /company/update:
 *  put:
 *    tags:
 *     - Company
 *    summary: Update company details
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              name:
 *                type: string
 *              users:
 *                type: array
 *                items:
 *                  type: string
 *              admin:
 *                type: array
 *                items:
 *                  type: string
 *              videos:
 *                type: array
 *                items:
 *                  type: string
 *    responses:
 *      200:
 *        description: Company updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      400:
 *        description: Bad request
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/update", authenticate, companyController.updateCompany);

/**
 * @openapi
 * /company/getCompanyById/{companyId}:
 *  get:
 *    tags:
 *     - Company
 *    summary: Get company data by ID
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: companyId
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Company data retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                companyData:
 *                  $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.get("/getCompanyById/:companyId", authenticate, companyController.getCompanyById);

/**
 * @openapi
 * /company/addUser:
 *  put:
 *    tags:
 *     - Company
 *    summary: Add a user to a company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              userId:
 *                type: string
 *    responses:
 *      200:
 *        description: User added to company successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/addUser", authenticate, companyController.addUserToCompany);

/**
 * @openapi
 * /company/removeUser:
 *  put:
 *    tags:
 *     - Company
 *    summary: Remove a user from a company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              userId:
 *                type: string
 *    responses:
 *      200:
 *        description: User removed from company successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/removeUser", authenticate, checkSystemRole,companyController.removeUserFromCompany);

/**
 * @openapi
 * /company/addAdmin:
 *  put:
 *    tags:
 *     - Company
 *    summary: Add an admin to a company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              adminId:
 *                type: string
 *    responses:
 *      200:
 *        description: Admin added to company successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/addAdmin", authenticate, checkSystemRole,companyController.addAdminToCompany);

/**
 * @openapi
 * /company/removeAdmin:
 *  put:
 *    tags:
 *     - Company
 *    summary: Remove an admin from a company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              adminId:
 *                type: string
 *    responses:
 *      200:
 *        description: Admin removed from company successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/removeAdmin", authenticate, checkSystemRole,companyController.removeAdminFromCompany);

/**
 * @openapi
 * /company/addVideo:
 *  put:
 *    tags:
 *     - Company
 *    summary: Add a video to a company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              videoId:
 *                type: string
 *    responses:
 *      200:
 *        description: Video added to company successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/addVideo", authenticate, companyController.addGuidToCompany);

/**
 * @openapi
 * /company/removeVideo:
 *  put:
 *    tags:
 *     - Company
 *    summary: Remove a video from a company
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *              videoId:
 *                type: string
 *    responses:
 *      200:
 *        description: Video removed from company successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateCompanyResponse'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.put("/removeVideo", authenticate, companyController.removeGuidFromCompany);


/**
 * @openapi
 * /company/delete:
 *  delete:
 *    tags:
 *     - Company
 *    summary: Delete a company by ID
 *    security:
 *    - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              companyId:
 *                type: string
 *    responses:
 *      200:
 *        description: Company deleted successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Company not found
 *      500:
 *        description: Internal Server Error
 */
router.delete("/delete/:companyId", authenticate, checkSystemRole, companyController.deleteCompany);

export default router;
