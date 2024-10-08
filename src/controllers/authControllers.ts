// src/controllers/authController.ts
import {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt, {JwtPayload} from "jsonwebtoken";
import User from "../models/userModel";
import { Language } from "../models/languageEnum";

const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET as string;
const jwtTokenExpiration: string = process.env.JWT_TOKEN_EXPIRATION as string;
const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET as string;

async function signup(req: Request, res: Response) {
    try {
        const {username, password, fullName} = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({username});
        if (existingUser)
            return res.status(409).json({message: "User already exists"});

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const newUser = new User({
            username: username,
            password: hashedPassword,
            fullName: fullName,
            language: Language.ENGLISH
        });

        const savedUser = await newUser.save();
        console.log(`user ${savedUser} saved successfully`)
        // Return a success message
        res.status(200).json({message: "User registered successfully"});
    } catch (error) {
        console.error("error while creating a user " + error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

async function login(req: Request, res: Response) {
    try {
        const {username, password} = req.body;

        // Check if the user exists
        const user = await User.findOne({username});
        if (!user)
            return res.status(401).json({message: "Invalid credentials"});

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return res.status(401).json({message: "Invalid credentials"});

        // Generate a JWT token upon successful login
        const AccessToken = jwt.sign({_id:user._id,role:user.role}, accessTokenSecret, {
            expiresIn: jwtTokenExpiration,
        });

        const refreshToken = jwt.sign({_id:user._id,role:user.role}, refreshTokenSecret);

        if (user.tokens == null) user.tokens = [refreshToken];
        else user.tokens.push(refreshToken);
        await user.save();
        // Return the token as { token }
        res.status(200).send({
            accessToken: AccessToken,
            refreshToken: refreshToken,
            userData: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

async function googleLogin(req: Request, res: Response) {
    try {
        const {credentials} = req.body;
        // Check if the user exists

        let user = await User.findOne({username: credentials.email});
        if (!user) {
            const hashedPassword = await bcrypt.hash("placeHolder", 10);
            const newUser = new User({
                username: credentials.email,
                password: hashedPassword,
                fullName: credentials.name,
                language: Language.ENGLISH,
                picture: credentials.picture
            });
            user = await newUser.save();
        }

        // Generate a JWT token upon successful login
        const AccessToken = jwt.sign({_id: user._id}, accessTokenSecret, {
            expiresIn: jwtTokenExpiration,
        });

        const refreshToken = jwt.sign({_id: user._id}, refreshTokenSecret);

        if (user.tokens == null) user.tokens = [refreshToken];
        else user.tokens.push(refreshToken);
        await user.save();
        // Return the token as { token }
        res.status(200).send({
            accessToken: AccessToken,
            refreshToken: refreshToken,
            userData: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}


async function refreshToken(req: Request, res: Response) {

    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[2];

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, refreshTokenSecret, async (err, userInfo) => {
        if (err) {
            console.log(err)
            return res.status(403).send(err.message);
        }

        try {
            const user = await User.findById((userInfo as JwtPayload)._id);

            if (!user?.tokens) {
                return res.status(400).send("User tokens not available");
            }

            if (!user.tokens.includes(token)) {
                user.tokens = [];
                await user?.save();

                return res.status(403).send("Invalid request");
            }

            const AccessToken = jwt.sign(
                {_id: user?._id},
                accessTokenSecret,
                {
                    expiresIn: jwtTokenExpiration,
                }
            );

            const refreshToken = jwt.sign(
                {_id: user?._id},
                refreshTokenSecret
            );
            user.tokens.push(refreshToken);
            await user?.save();

            res.status(200).send({
                accessToken: AccessToken,
                refreshToken: refreshToken,
            });
        } catch (err) {
            return res.status(403).send(err);
        }
    });
}


async function logout(req: Request, res: Response) {
    const authHeaders = req.headers["authorization"];
    const refreshToken = authHeaders && authHeaders.split(" ")[2];

    if (refreshToken == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(refreshToken, refreshTokenSecret, async (err, userInfo) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).send(err.message);
        }

        try {
            const user = await User.findById((userInfo as JwtPayload)._id);
            if (!user || !user.tokens || !user.tokens.includes(refreshToken)) {
                return res.status(403).send("Invalid request");
            }

            user.tokens.splice(user.tokens.indexOf(refreshToken), 1);
            await user.save();
            return res.json({ message: "Logged out successfully" });
        } catch (err) {
            return res.status(500).send("Server error");
        }
    });
}

// change user password
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.body["user"]["_id"]
        const { currentPassword, newPassword } = req.body;
        // Check if the user exists

        const existingUser = await User.findOne({_id: userId});
        if (!existingUser)
            return res.status(401).json({message: "Invalid credentials"});

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(currentPassword, existingUser.password);
        if (!passwordMatch)
            return res.status(401).json({message: "Invalid credentials"});
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        existingUser.password = hashedPassword
        await existingUser.save()

        res.status(200).send({ message: "updated password successfully" });

    } catch (error) {
        console.error("updating user password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {signup, login, googleLogin, logout, refreshToken};