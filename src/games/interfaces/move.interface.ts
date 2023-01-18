import { GameMovesTypes } from "../enums/moves.enum";

export interface Move {
    choice: GameMovesTypes;
    createdAt: Date;
}