import {Inject, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {GAME_MODEL_IDENTIFIER} from 'src/common/constants';
import {Game} from './interfaces/game.interface';
import {Round} from './interfaces/round.interface';
import { UsersService } from '../users/users.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameMoveDto } from './dto/create-game-move.dto';

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
        game.set({creator: userId, status: {status: 'pending', createdAt: new Date(), score: {creator: 0, opponent: 0}}});
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
        await game.save();
        return game;
    }

}
