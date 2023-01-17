import {Inject, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {GAME_MODEL_IDENTIFIER} from '../common/constants';
import {Game} from './interfaces/game.interface';

import {Round} from './interfaces/round.interface';
import { UsersService } from '../users/users.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameMoveDto } from './dto/create-game-move.dto';
import { RESULT_CHECKER } from './constants';
import { Status } from './interfaces/status.interface';
import { GAME_STRINGS } from './constants';

@Injectable()
export class GamesService {

    constructor(
        @Inject(GAME_MODEL_IDENTIFIER) private gameModel: Model<Game>,
        private _usersService: UsersService,
    ) {
    }

    /**
     * Find all games
     *
     * @returns {Promise<Game[]>}
     * @memberof GamesService
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
     *
     * @returns {Promise<Game[]>}
     * @memberof GamesService
     */
    async findAllPending(): Promise<Game[]> {
        const allGames = await this.findAll();
        return allGames.filter(game => game.status.status === GAME_STRINGS.STATUS.PENDING);
    }

    /**
     * Find one game by its id
     *
     * @param {string} id
     * @returns {Promise<Game>}
     * @memberof GamesService
     */
    async findById(id: string): Promise<Game> {
        return this.gameModel.findOne({_id: id}).exec();
    }

    /**
     * Create a game
     *
     * @param {CreateGameDto} createGameDto
     * @param {string} userId
     * @returns {Promise<Game>}
     * @memberof GamesService
     */
    async createGame(createGameDto: CreateGameDto, userId: string): Promise<Game> {
        const game = new this.gameModel(createGameDto);
        game.set({creator: userId, currentRound: 1, status: {status: GAME_STRINGS.STATUS.PENDING, createdAt: new Date(), currentRound: 1, score: {creator: 0, opponent: 0}}});
        await game.save();
        return game;
    }

    /**
     * Insert a new move in a game round
     *
     * @param {CreateGameMoveDto} createGameMoveDto
     * @param {string} userId
     * @returns {Promise<Game>}
     * @memberof GamesService
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

    /**
     * Update round result if it can do so
     *
     * @param {Game} game
     * @param {number} roundIndex
     * @returns {Game}
     * @memberof GamesService
     */
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

    /**
     * Calculate round result
     *
     * @param {Game} game
     * @param {Round} round
     * @returns {string}
     * @memberof GamesService
     */
    calculateRoundResult(game: Game, round: Round): string {
        return RESULT_CHECKER[game.mode][round.creatorMove.choice][round.opponentMove.choice];
    }

    /**
     * Update game status
     *
     * @param {Game} game
     * @param {Round} round
     * @returns {Game}
     * @memberof GamesService
     */
    updateGameStatus(game: Game, round: Round): Game {
        game.status.currentRound = game.status.currentRound + 1;
        const status = JSON.parse(JSON.stringify(game.status));
        if (round.winner === GAME_STRINGS.WINNERS.DRAW) {
            status.score.creator = status.score.creator + 1;
            status.score.opponent = status.score.opponent + 1;
        } else {
            status.score[round.winner] = status.score[round.winner] + 1;
        }
        if (game.rounds.length === game.roundNumber) {
            status.winner = this.calculateGameResult(status);
            status.endedAt = new Date();
            status.status = GAME_STRINGS.STATUS.ENDED;
        }
        game.status = status;
        return game;
    }

    /**
     * Calculate game result
     *
     * @param {Status} status
     * @returns {string}
     * @memberof GamesService
     */
    calculateGameResult(status: Status): string {
        if (status.score.creator === status.score.opponent) {
            return GAME_STRINGS.WINNERS.DRAW;
        } else {
            return status.score.creator > status.score.opponent ? GAME_STRINGS.WINNERS.CREATOR : GAME_STRINGS.WINNERS.OPPONENT;
        }
    }

}
