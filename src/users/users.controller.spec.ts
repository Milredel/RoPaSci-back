import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { expect, stub, stubClass } from '../../src/test';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: UsersService;

    beforeEach(() => {
        controller = new UsersController(
            usersService = stubClass(UsersService)
        );
    });

    it('should init the controller', () => {
        return expect(controller).to.not.be.undefined;
    });

    describe('findAll', () => {
        it('should call usersService.findAll', () => {
            stub(usersService, 'findAll');
            controller.findAll();
            return (expect(usersService.findAll) as any).to.have.been.called;
        });
    });

});
