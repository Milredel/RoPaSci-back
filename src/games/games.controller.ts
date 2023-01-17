import { Controller, Get, Param, Put, Body, Post, HttpException, HttpStatus, Delete, UseGuards, Req, Inject } from '@nestjs/common';
import { Game } from './interfaces/game.interface';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameMoveDto } from './dto/create-game-move.dto';

@Controller('games')
export class GamesController {
    constructor(
        private gamesService: GamesService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    /**
     * Find all games in pending status
     *
     * @returns {Promise<Game[]>}
     * @memberof GamesController
     */
    @UseGuards(JwtAuthGuard)
    @Get('pending')
    async findAll(): Promise<Game[]> {
        return await this.gamesService.findAllPending();
    }

    /**
     * Find a game by its id
     *
     * @param {string} id
     * @returns {Promise<Game>}
     * @memberof GamesController
     */
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string): Promise<Game> {
        return await this.gamesService.findById(id);
    }

    /**
     * Create a new game
     *
     * @param {CreateGameDto} createGameDto
     * @param {(Request | any)} request
     * @returns {Promise<any>}
     * @memberof GamesController
     */
    @UseGuards(JwtAuthGuard)
    @Post('createGame')
    async createGame(@Body() createGameDto: CreateGameDto, @Req() request: Request | any): Promise<any> {
        try {
            let userId = null;
            if (Object.prototype.hasOwnProperty.call(request, 'user') && Object.prototype.hasOwnProperty.call(request.user, 'userId')) {
                userId = request.user.userId;
            }
            const result = await this.gamesService.createGame(createGameDto, userId);
            this.logger.info(`${request.user.username} has created a game (mode: ${createGameDto.mode}, roundNumber: ${createGameDto.roundNumber}, opponent: ${createGameDto.opponent})`);
            return result;
        } catch (e) {
            this.logger.error(`${e.message}`);
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: e.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Create a new move for the given game and round
     *
     * @param {CreateGameMoveDto} createGameMoveDto
     * @param {(Request | any)} request
     * @returns {Promise<any>}
     * @memberof GamesController
     */
    @UseGuards(JwtAuthGuard)
    @Post('move')
    async createGameMove(@Body() createGameMoveDto: CreateGameMoveDto, @Req() request: Request | any): Promise<any> {
        try {
            let userId = null;
            if (Object.prototype.hasOwnProperty.call(request, 'user') && Object.prototype.hasOwnProperty.call(request.user, 'userId')) {
                userId = request.user.userId;
            }
            const result = await this.gamesService.createGameMove(createGameMoveDto, userId);
            this.logger.info(`${request.user.username} has created a game move: (game id: ${createGameMoveDto.gameId}, round: ${createGameMoveDto.round}, move: ${createGameMoveDto.move})`);
            return result;
        } catch (e) {
            this.logger.error(`${e.message}`);
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: e.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }
}
