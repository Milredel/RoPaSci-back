import { Score } from './score.interface';
import { GameWinnersTypes } from '../enums/winners.enum';
import { GameStatusTypes } from '../enums/status.enum';

export interface Status {
    status: GameStatusTypes;
    score: Score;
    winner?: GameWinnersTypes;
    createdAt: Date;
    endedAt?: Date;
    currentRound: number;
}