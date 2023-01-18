import { Document } from 'mongoose';
import { Status } from './status.interface';
import { Round } from './round.interface';
import { GameModesTypes } from '../enums/modes.enum';

export interface Game extends Document {
    status: Status;
    roundNumber: number;
    mode: GameModesTypes;
    opponent: string;
    creator: string;
    creatorUsername: string;
    rounds: Round[];
}