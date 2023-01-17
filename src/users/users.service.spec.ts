import { UsersService } from './users.service';
import { expect, stub, stubClass } from '../../src/test';

describe('UsersService', () => {
    let service: UsersService;
    let userModel: any;

    beforeEach(() => {
        service = new UsersService(
            userModel = {
                find: () => {return { exec: () => null}},
                findOne: () => {return { exec: () => null}}
            } as any
        );
    });

    it('should init the service', () => {
        return expect(service).to.not.be.undefined;
    });

    describe('findAll', () => {
        it('should call userModel.find()', () => {
            stub(userModel, 'find');
            service.findAll();
            return (expect(userModel.find) as any).to.have.been.called;
        });
    });

    describe('findByUsername', () => {
        it('should call userModel.find({username: username})', () => {
            stub(userModel, 'find');
            service.findByUsername('toto');
            return (expect(userModel.find) as any).to.have.been.calledWith({username: 'toto'});
        });
    });

    describe('findById', () => {
        it('should call userModel.find({_id: id})', () => {
            stub(userModel, 'findOne');
            service.findById('666');
            return (expect(userModel.findOne) as any).to.have.been.calledWith({_id: '666'});
        });
    });
});
