// src/app.ts
import fs from 'fs'
import https from 'https'
import express from 'express';
import {closeDB, connectDB} from './db/db';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import companyRouter from './routes/companyRoutes';
import './models/guidModule';

import cors from 'cors';
import path from 'path';
import SwaggerDocs from "./utils/swagger";

export const app = express();
const PORT: number = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();


app.use(function(req,res,next){
 res.header("Access-Control-Allow-Origin",'*')
 res.header("Access-Control-Allow-Headers",'*')
 res.header("Access-Control-Allow-Methods",'*')
 next()
})

app.use(cors());


// Middleware
app.use(express.json());


app.use('/images', express.static(path.join(process.cwd(), 'public', 
'images')));

app.use('/company', companyRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)



export const server = app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);})

SwaggerDocs(app, 4001);


// https.createServer(app).listen(3001)





