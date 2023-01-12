import { Controller, Get, UseGuards } from '@nestjs/common';
import { Game } from './interfaces/game.interface';
import { GamesService } from './games.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('games')
export class GamesController {
    constructor(
        private gamesService: GamesService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Game[]> {
        return await this.gamesService.findAll();
    }
}
