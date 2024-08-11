import mongoose, { ClientSession } from 'mongoose';
import { Request, Response } from 'express';

export async function startTransaction(): Promise<ClientSession> {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
}

export async function commitTransaction(session: ClientSession) {
    await session.commitTransaction();
    session.endSession();
}

export async function abortTransaction(session: ClientSession) {
    await session.abortTransaction();
    session.endSession();
}

export async function handleTransactionError(session: ClientSession, error: any, res: Response) {
    await abortTransaction(session);
    return res.status(500).json({ error: 'Failed to save guide', details: error });
}