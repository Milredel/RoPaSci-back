import { Controller, Request, Post, UseGuards, Inject } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller()
export class AppController {

    constructor(
        private authService: AuthService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

    @UseGuards(LocalAuthGuard)
    @Post('auth/login')
    async login(@Request() req) {
        this.logger.notice(`Connexion de l'utilisateur ${req.user.username}`);
        return this.authService.login(req.user);
    }

    /**
     * Utility endpoint in order to create hash password to be inserted in DB
     * EX: curl -X POST http://localhost:3000/auth/hash-pass -d '{"password": "pass_to_be_hashed"}' -H "Content-Type: application/json"
     * @param req  : {"password": "pass_to_be_hashed"}
     * @returns hashed password
     */
    @Post('auth/hash-pass')
    async hashPass(@Request() req) {
        return this.authService.hashPass(req.body);
    }

}