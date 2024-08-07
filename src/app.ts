// src/app.ts
import fs from 'fs'
import https, { Server as HttpsServer } from 'https';
import http, { Server as HttpServer } from 'http';
import express from 'express';
import {closeDB, connectDB} from './db/db';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import companyRouter from './routes/companyRoutes';
import './models/guideModel';
import guideRoutes from './routes/guideRoutes';
import cors from 'cors';
import path from 'path';
import SwaggerDocs from "./utils/swagger";

export const app = express();
const PORT = parseInt(process.env.PORT) || 3001;

// Connect to MongoDB
connectDB();

let server: HttpServer | HttpsServer;

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

SwaggerDocs(app, PORT);

if (process.env.NODE_ENV !== 'production') {
  console.log('development');
  server = http.createServer(app).listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
  });
} else {
  console.log('PRODUCTION');
  const options2 = {
    key: fs.readFileSync('/home/st111/cert/client-key.pem'),
    cert: fs.readFileSync('/home/st111/cert/client-cert.pem')
  };
  server = https.createServer(options2, app).listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
  });
}

export { server };





