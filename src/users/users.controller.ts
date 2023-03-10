import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,

    ) { }

    /**
     * Find all users
     *
     * @returns {Promise<User[]>}
     * @memberof UsersController
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<User[]> {
        return await this.usersService.findAll();
    }
}
