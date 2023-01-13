import { Document } from 'mongoose';
import { Status } from './status.interface';
import { Round } from './round.interface';

export interface Game extends Document {
    status: Status;
    roundNumber: number;
    mode: string;
    opponent: string;
    creator: string;
    creatorUsername: string;
    rounds: Round[];
}