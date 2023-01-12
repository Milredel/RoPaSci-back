import { Controller, Get, Param, Put, Body, Post, HttpException, HttpStatus, Delete, UseGuards, Req, Inject } from '@nestjs/common';
import { Game } from './interfaces/game.interface';
import { GamesService } from './games.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateGameDto } from './dto/create-game.dto';

@Controller('games')
export class GamesController {
    constructor(
        private gamesService: GamesService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Game[]> {
        return await this.gamesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('createGame')
    async createGame(@Body() createGameDto: CreateGameDto, @Req() request: Request | any): Promise<any> {
        try {
            let userId = null;
            if (Object.prototype.hasOwnProperty.call(request, 'user') && Object.prototype.hasOwnProperty.call(request.user, 'userId')) {
                userId = request.user.userId;
            }
            const result = await this.gamesService.createGame(createGameDto, userId);
            this.logger.info(`${request.user.username} has created a game: \n\tmode: ${createGameDto.mode} \n\troundNumber: ${createGameDto.roundNumber} \n\topponent: ${createGameDto.opponent}`);
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
