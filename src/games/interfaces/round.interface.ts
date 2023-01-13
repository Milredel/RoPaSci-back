import { Move } from './move.interface';

export interface Round {
    creatorMove?: Move;
    opponentMove?: Move;
    createdAt: Date;
}