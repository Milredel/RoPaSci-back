import {Inject, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {GAME_MODEL_IDENTIFIER} from 'src/common/constants';
import {Game} from './interfaces/game.interface';
import {Round} from './interfaces/round.interface';
import { UsersService } from '../users/users.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameMoveDto } from './dto/create-game-move.dto';
import { RESULT_CHECKER } from './constants';
import { Status } from './interfaces/status.interface';

@Injectable()
export class GamesService {

    constructor(
        @Inject(GAME_MODEL_IDENTIFIER) private gameModel: Model<Game>,
        private _usersService: UsersService,
    ) {
    }

    /**
     * Find all games
     */
    async findAll(): Promise<Game[]> {
        const allGames = await this.gameModel.find().exec();
        const res = [];
        for (const game of allGames) {
            const gameToReturn = JSON.parse(JSON.stringify(game));
            const creatorUsername = await this._usersService.findById(game.creator);
            gameToReturn.creatorUsername = creatorUsername.username;
            res.push(gameToReturn);
        }
        return res;
    }

    /**
     * Find all pending games
     */
    async findAllPending(): Promise<Game[]> {
        const allGames = await this.findAll();
        return allGames.filter(game => game.status.status === 'pending');
    }

    /**
     * Find one game by its id
     *
     * @params id string
     * @returns Game
     */
    async findById(id: string): Promise<Game> {
        return this.gameModel.findOne({_id: id}).exec();
    }


    /**
     * Create a game
     *
     * @param createGameDto
     */
    async createGame(createGameDto: CreateGameDto, userId: string): Promise<Game> {
        const game = new this.gameModel(createGameDto);
        game.set({creator: userId, currentRound: 1, status: {status: 'pending', createdAt: new Date(), currentRound: 1, score: {creator: 0, opponent: 0}}});
        await game.save();
        return game;
    }

    /**
     * Insert a new move in a game round
     *
     * @param createGameMoveDto
     */
    async createGameMove(createGameMoveDto: CreateGameMoveDto, userId: string): Promise<Game> {
        const game = await this.findById(createGameMoveDto.gameId);
        if (!game) {
            throw new Error('Unable to find game with id ' + createGameMoveDto.gameId);
        }
        const requesterIsComputer = Object.prototype.hasOwnProperty.call(createGameMoveDto, 'isComputer') && createGameMoveDto.isComputer === true;
        if (game.creator !== userId) { // TODO integrate test of opponent player's id if human
            throw new Error(`You can't play this game`);
        }
        const roundIndex = createGameMoveDto.round - 1;
        const rounds = JSON.parse(JSON.stringify(game.rounds));
        if (!rounds[roundIndex]) {
            rounds[roundIndex] = {createdAt: new Date()};
        }
        let roundPlayerLabel = game.creator === userId ? 'creatorMove' : 'opponentMove';
        roundPlayerLabel = requesterIsComputer ? 'opponentMove' : roundPlayerLabel;
        if (Object.prototype.hasOwnProperty.call(rounds[roundIndex], roundPlayerLabel)) {
            throw new Error(`Cannot play twice on same round`);
        }
        rounds[roundIndex][roundPlayerLabel] = {choice: createGameMoveDto.move, createdAt: new Date()};
        game.rounds = rounds;
        this.updateRoundResult(game, roundIndex);
        await game.save();
        return game;
    }

    updateRoundResult(game: Game, roundIndex: number): Game {
        const round = game.rounds[roundIndex];
        if (Object.prototype.hasOwnProperty.call(round, 'creatorMove')
            && Object.prototype.hasOwnProperty.call(round, 'opponentMove')) {
            round.winner = this.calculateRoundResult(game, round);
            round.endEdAt = new Date();
            this.updateGameStatus(game, round);
        }
        return game;
    }

    calculateRoundResult(game: Game, round: Round): string {
        return RESULT_CHECKER[game.mode][round.creatorMove.choice][round.opponentMove.choice];
    }

    updateGameStatus(game: Game, round: Round): Game {
        game.status.currentRound = game.status.currentRound + 1;
        const status = JSON.parse(JSON.stringify(game.status));
        if (round.winner === 'draw') {
            status.score.creator = status.score.creator + 1;
            status.score.opponent = status.score.opponent + 1;
        } else {
            status.score[round.winner] = status.score[round.winner] + 1;
        }
        if (game.rounds.length === game.roundNumber) {
            status.winner = this.calculateGameResult(status);
            status.endedAt = new Date();
            status.status = 'ended';
        }
        game.status = status;
        return game;
    }

    calculateGameResult(status: Status): string {
        if (status.score.creator === status.score.opponent) {
            return 'draw';
        } else {
            return status.score.creator > status.score.opponent ? 'creator' : 'opponent';
        }
    }

}
