import { Move } from './move.interface';

export interface Round {
    creatorMove?: Move;
    opponentMove?: Move;
    createdAt: Date;
    endEdAt?: Date;
    winner?: string; // creator | opponent | draw
}