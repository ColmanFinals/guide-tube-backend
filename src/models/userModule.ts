import mongoose, { Document, Schema } from "mongoose";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInput:
 *      type: object
 *      required:
 *        - username
 *        - password
 *        - fullName
 *      properties:
 *        username:
 *          type: string
 *          default: JaneDoe
 *        password:
 *          type: string
 *          default: stringPassword123
 *        fullName:
 *          type: string
 *          default: Jane Doe
 *        role:
 *          type: string
 *          default: user
 *    CreateUserResponse:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *        password:
 *          type: string
 *        fullName:
 *          type: string
 *        role:
 *          type: string
 *    LoginUserInput:
 *      type: object
 *      required:
 *        - username
 *        - password
 *      properties:
 *        username:
 *          type: string
 *          default: JaneDoe
 *        password:
 *          type: string
 *          default: stringPassword123
 *    LoginUserResponse:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *        password:
 *          type: string
 */

export interface IUser extends Document {
    username: string;
    password: string;
    fullName: string;
    tokens: string[];
    picture: string;
    role: string; // Add role field to the interface
}

const defaultPicturePath = "images/default-user-profile.jpg"; // Set your default path here

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    tokens: { type: [String], required: true },
    picture: { type: String, default: defaultPicturePath, required: true },
    role: { type: String, default: "user" } // Add role field with default value
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
