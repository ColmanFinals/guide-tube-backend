
import express, { Express } from 'express';
import {closeDB, connectDB} from './db/db';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import companyRouter from './routes/companyRoutes';
import './models/guideModel';
import guideRoutes from './routes/guideRoutes';
import cors from 'cors';
import path from 'path';

import './models/guideModel';

const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>(async (resolve) => {
    // Connect to MongoDB
    await connectDB();
    const app = express();

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
    app.use('/guide', guideRoutes)
    console.log("finished init app")
    resolve(app);
})
return promise;
}

export default initApp;





