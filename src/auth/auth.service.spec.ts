import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { expect, stub, stubClass } from '../../src/test';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    beforeEach(() => {
        service = new AuthService(
            usersService = stubClass(UsersService),
            jwtService
        );
    });

    it('should init the service', () => {
        return expect(service).to.not.be.undefined;
    });

    describe('validateUser', () => {
        it('should call usersService.findByUsername and return null if no user found', async () => {
            stub(usersService, 'findByUsername').callsFake(() => null);
            const res = await service.validateUser('toto', 'totopwd');
            return (expect(usersService.findByUsername) as any).to.have.been.calledWith('toto')
                && (expect(res) as any).to.be.deep.eq(null);
        });

        it('should call usersService.findByUsername and service.checkPassword and return null if password is invalid', async () => {
            stub(usersService, 'findByUsername').callsFake(() => {return [{username: 'toto', password: 'mypwd'}]; });
            stub(service, 'checkPassword').returns(false);
            const res = await service.validateUser('toto', 'totopwd');
            return (expect(usersService.findByUsername) as any).to.have.been.calledWith('toto')
                && (expect(service.checkPassword) as any).to.have.been.calledWith('totopwd', 'mypwd')
                && (expect(res) as any).to.be.deep.eq(null);
        });

        it('should return user if all good', async () => {
            stub(usersService, 'findByUsername').callsFake(() => {return [{username: 'toto', password: 'mypwd'}]; });
            stub(service, 'checkPassword').returns(true);
            const res = await service.validateUser('toto', 'totopwd');
            return (expect(usersService.findByUsername) as any).to.have.been.calledWith('toto')
                && (expect(service.checkPassword) as any).to.have.been.calledWith('totopwd', 'mypwd')
                && (expect(res) as any).to.be.deep.eq({username: 'toto', password: 'mypwd'});
        });
    });

    describe('checkPassword', () => {
        it('should call bcrypt.compare with correct args', () => {
            stub(bcrypt, 'compare');
            service.checkPassword('pwd1', 'pwd2');
            return (expect(bcrypt.compare) as any).to.have.been.calledWith('pwd1', 'pwd2');
        });
    });

    describe('hashPass', () => {
        it('should throw correct exception if no password given', async () => {
            try {
                stub(bcrypt, 'hash');
                service.hashPass({some: 'request'});
                expect.fail();
            } catch (e) {
                return (expect(bcrypt.hash) as any).to.not.have.been.called;
            }
        });

        it('should call bcrypt.hash and return hash if all good', async () => {
            stub(bcrypt, 'hash').callsFake(() => 'hashpwd');
            const res = await service.hashPass({password: 'pwd'});
            return (expect(bcrypt.hash) as any).to.have.been.calledWith('pwd', BCRYPT_SALT_ROUNDS)
                && (expect(res) as any).to.be.deep.eq('hashpwd');
        });
    });
});
