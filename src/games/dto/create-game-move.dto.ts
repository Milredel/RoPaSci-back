export class CreateGameMoveDto {
    gameId: string;
    round: number;
    move: string;
    isComputer?: boolean;
}
