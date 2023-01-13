import {Inject, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {GAME_MODEL_IDENTIFIER} from 'src/common/constants';
import {Game} from './interfaces/game.interface';
import { UsersService } from '../users/users.service';
import { CreateGameDto } from './dto/create-game.dto';

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
     * @params id number
     * @returns Game
     */
    async findById(id: number): Promise<Game[]> {
        return this.gameModel.find({id: id}).exec();
    }


    /**
     * Create a game
     *
     * @param createGameDto
     */
    async createGame(createGameDto: CreateGameDto, userId: number): Promise<Game> {
        const game = new this.gameModel(createGameDto);
        game.set({creator: userId, status: {status: 'pending', createdAt: new Date(), score: {creator: 0, opponent: 0}}});
        await game.save();
        return game;
    }
}
