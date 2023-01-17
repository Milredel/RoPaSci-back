import { UnauthorizedException, Injectable, HttpException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (!user || user.length !== 1) {
            return null;
        }
        const passwordIsValid = await this.checkPassword(password, user[0].password)
        if(!passwordIsValid) {
            return null;
        }
        return user[0];
    }

    async checkPassword(password: string, encryptedPasword: string): Promise<boolean> {
        return await bcrypt.compare(password, encryptedPasword);
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    /**
     *
     * @param reqBody
     */
    async hashPass(reqBody: any): Promise<string> {
        if (!Object.prototype.hasOwnProperty.call(reqBody, 'password')) {
            throw new HttpException('Format de la requête non valide. Veuillez fournir un password.', 400);
        }
        const password = reqBody.password;
        return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }
}