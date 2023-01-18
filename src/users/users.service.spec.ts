import { UsersService } from './users.service';
import { expect, stub, stubClass } from '../../src/test';

describe('UsersService', () => {
    let service: UsersService;
    let userModel: any;

    beforeEach(() => {
        service = new UsersService(
            userModel = { // definitely not the way to do it
                find: () => {return { exec: () => null}},
                findOne: () => {return { exec: () => null}}
            } as any
        );
    });

    it('should init the service', () => {
        return expect(service).to.not.be.undefined;
    });

    describe('findAll', () => {
        it('should call userModel.find()', async () => {
            stub(userModel, 'find').callsFake(() => { return { exec: () => [
                {some: 'user 1 data', username: 'toto 1', _id: '111'},
                {some: 'user 2 data', username: 'toto 2', _id: '222'},
                {some: 'user 3 data', username: 'toto 3', _id: '333'}
            ]}});
            const res = await service.findAll();
            return (expect(userModel.find) as any).to.have.been.called
                && (expect(res) as any).to.be.deep.eq([
                    {username: 'toto 1', id: '111'},
                    {username: 'toto 2', id: '222'},
                    {username: 'toto 3', id: '333'}
                ]);
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
