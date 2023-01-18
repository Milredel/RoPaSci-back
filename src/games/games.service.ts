import {Inject, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {GAME_MODEL_IDENTIFIER} from '../common/constants';
import {Game} from './interfaces/game.interface';
import {Round} from './interfaces/round.interface';
import { UsersService } from '../users/users.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameMoveDto } from './dto/create-game-move.dto';
import { GameModesTypes, RESULT_CHECKER } from './constants';
import { Status } from './interfaces/status.interface';
import { GameStatusTypes, GameWinnersTypes } from './constants';
import * as moment from 'moment';
import { StatisticsByModesType, StatisticsType } from './interfaces/statistics.interface';

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
        return allGames.filter(game => game.status.status === GameStatusTypes.PENDING);
    }

    /**
     * Find all ended games by the given user
     *
     * @param {string} userId
     * @param {number} [page=null]
     * @param {number} [limit=null]
     * @returns {Promise<Game[]>}
     * @memberof GamesService
     */
    async findEndedGames(userId: string, page: number = null, limit: number = null): Promise<Game[]> {
        const options = {sort: {'status.createdAt': -1}};
        if (page !== null && limit !== null) {
            Object.assign(options, {limit: 5, skip: (page*limit)});
        }
        const games = await this.gameModel.find({'status.status': GameStatusTypes.ENDED, 'creator': userId}, null, options).exec();
        const res = [];
        for (const game of games) {
            const gameToReturn = JSON.parse(JSON.stringify(game));
            const creatorUsername = await this._usersService.findById(game.creator);
            gameToReturn.creatorUsername = creatorUsername.username;
            res.push(gameToReturn);
        }
        return res;
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
        game.set({creator: userId, currentRound: 1, status: {status: GameStatusTypes.PENDING, createdAt: new Date(), currentRound: 1, score: {creator: 0, opponent: 0}}});
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
    calculateRoundResult(game: Game, round: Round): GameWinnersTypes {
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
        if (round.winner === GameWinnersTypes.DRAW) {
            status.score.creator = status.score.creator + 1;
            status.score.opponent = status.score.opponent + 1;
        } else {
            status.score[round.winner] = status.score[round.winner] + 1;
        }
        if (game.rounds.length === game.roundNumber) {
            status.winner = this.calculateGameResult(status);
            status.endedAt = new Date();
            status.status = GameStatusTypes.ENDED;
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
    calculateGameResult(status: Status): GameWinnersTypes {
        if (status.score.creator === status.score.opponent) {
            return GameWinnersTypes.DRAW;
        } else {
            return status.score.creator > status.score.opponent ? GameWinnersTypes.CREATOR : GameWinnersTypes.OPPONENT;
        }
    }

    /**
     * Computes game stats for the given user
     *
     * @param {string} userId
     * @returns {Promise<any>}
     * @memberof GamesService
     */
    async computeStats(userId: string): Promise<StatisticsType> {
        const stats = {} as StatisticsType;
        const allEndedGames = await this.findEndedGames(userId);
        const allPendingGames = await this.findAllPending();
        stats.totalPlayedGames = allEndedGames.length;
        stats.playedByModes = {} as StatisticsByModesType;
        stats.playedByModes[GameModesTypes.CLASSIC] = allEndedGames.filter(game => game.mode === GameModesTypes.CLASSIC).length;
        stats.playedByModes[GameModesTypes.FRENCH] = allEndedGames.filter(game => game.mode === GameModesTypes.FRENCH).length;
        stats.playedByModes[GameModesTypes.STAR_TREK] = allEndedGames.filter(game => game.mode === GameModesTypes.STAR_TREK).length;
        stats.totalPendingGames = allPendingGames.length;
        stats.totalScoreVsComputer = { // assuming there is no human opponent
            'win': allEndedGames.filter(game => game.status.winner === GameWinnersTypes.CREATOR).length,
            'lose': allEndedGames.filter(game => game.status.winner === GameWinnersTypes.OPPONENT).length,
            'draw': allEndedGames.filter(game => game.status.winner === GameWinnersTypes.DRAW).length
        };
        stats.averageTime = allEndedGames.map(game => moment(game.status.endedAt).diff(moment(game.status.createdAt))).reduce((a,b,i) => a+(b-a)/(i+1));
        return stats;
    }

}
