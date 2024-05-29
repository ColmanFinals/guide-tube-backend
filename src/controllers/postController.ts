// postController.ts
import {Request, Response} from "express";
import Post, {IComment, IPost} from "../models/postModule";
import * as fileController from "./fileController";
import User, {IUser} from "../models/userModule";

export const createPost = async (req: Request, res: Response) => {
    try {
        // Extract data from the request body
        const {name, creatorUserId, creatorName} = req.body;

        // Extract file information from req.files
        const picture: Express.Multer.File = (req.files as any)["picture"][0];
        const gameFile: Express.Multer.File = (req.files as any)["gameFile"][0];

        // Construct the file paths
        const picturePath = `images/${picture.filename}`;
        const gameFilePath = `images/${gameFile.filename}`;

        // Create a new post object
        const newPost = new Post({
            name: name,
            creatorName: creatorName,
            pictureUrl: picturePath,
            gameFileUrl: gameFilePath,
            creatorUserId: creatorUserId,
        });

        // Save the post to the database
        const savedPost = await newPost.save();

        res.status(201).json(savedPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
export const updatePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;

        // Extract only the name from req.body
        const {name} = req.body;

        // Update only the name in the database
        const updatedPost: IPost | null = await Post.findByIdAndUpdate(
            postId,
            {name},
            {new: true}
        );

        if (!updatedPost) {
            return res.status(404).json({error: "Post not found"});
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const deletedPost: any = await Post.findByIdAndDelete(postId); //Change the any

        if (!deletedPost) {
            return res.status(404).json({error: "Post not found"});
        } else {
            const pictureUrl = "public/" + deletedPost.pictureUrl;
            const gameFileUrl = "public/" + deletedPost.gameFileUrl;

            fileController.deleteFile(pictureUrl);
            fileController.deleteFile(gameFileUrl);
        }

        res.status(200).json(deletedPost);
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const Posta: any = await Post.findById(postId); //Change the any

        if (!Post) {
            return res.status(404).json({error: "Post not found"});
        } else {
            res.status(200).json(Posta);

        }


    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        // Retrieve all posts from the database
        const allPosts: IPost[] = await Post.find();

        res.status(200).json(allPosts);
    } catch (error) {
        console.error("Error fetching all posts:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};


export const addComment = async (req: Request, res: Response) => {
    try {

        // Extract comment information from the request body
        const {text, userId, postId} = req.body;

        // Find the post to which the comment will be added
        const post: IPost | null = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({error: "Post not found"});
        }
        const user: IUser | null = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: "Post not found"});
        }
        // Create a new comment
        const newComment: IComment = {
            text: text,
            author: user.fullName, // Assuming userId corresponds to creatorUserId
        };

        // Add the comment to the post's comments array
        post.comments.push(newComment);

        // Save the updated post with the new comment
        const updatedPost: IPost | null = await post.save();

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getPostComments = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;

        // Find the post by postId
        const post: IPost | null = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({error: "Post not found"});
        }

        // Extract comments from the post
        const comments = post.comments;


        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching post comments:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};