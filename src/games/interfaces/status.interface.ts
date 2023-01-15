import { Score } from './score.interface';

export interface Status {
    status: string; // pending | ended
    score: Score;
    winner?: string; // creator | opponent | draw
    startedAt: Date;
    endedAt?: Date;
    currentRound: number;
}