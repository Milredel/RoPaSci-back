import { Move } from './move.interface';
import { GameWinnersTypes } from '../enums/winners.enum';

export interface Round {
    creatorMove?: Move;
    opponentMove?: Move;
    createdAt: Date;
    endEdAt?: Date;
    winner?: GameWinnersTypes;
}