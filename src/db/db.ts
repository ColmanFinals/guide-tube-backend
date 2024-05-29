// src/config/db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config()


const mongoUri: string = "mongodb://0.0.0.0:27017"

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error: ', err);
        process.exit(1);
    }
};

const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB Connection Closed');
    } catch (err) {
        console.error('Error closing MongoDB connection: ', err);
    }
};
export {closeDB, connectDB};
