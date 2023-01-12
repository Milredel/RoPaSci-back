import { Document } from 'mongoose';

export interface Game extends Document{
    readonly id: number;
    readonly status: string;
    readonly roundNumber: number;
    readonly mode: string;
    readonly opponent: string;
    readonly creator: number;
    creatorUsername: string;
}