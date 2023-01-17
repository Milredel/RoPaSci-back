import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { expect, stub, stubClass } from '../../src/test';
import * as winston from 'winston';
import { GAME_STRINGS } from './constants';

describe('GamesController', () => {
    let controller: GamesController;
    let gamesService: GamesService;
    const logger = winston.createLogger();

    beforeEach(() => {
        controller = new GamesController(
            gamesService = stubClass(GamesService),
            logger
        );
    });

    it('should init the controller', () => {
        return expect(controller).to.not.be.undefined;
    });

    describe('findAll', () => {
        it('should call gamesService.findAllPending', () => {
            stub(gamesService, 'findAllPending');
            controller.findAll();
            return (expect(gamesService.findAllPending) as any).to.have.been.called;
        });
    });

    describe('findById', () => {
        it('should call gamesService.findById with correct arg', () => {
            stub(gamesService, 'findById');
            controller.findById('666');
            return (expect(gamesService.findById) as any).to.have.been.calledWith('666');
        });
    });

    describe('createGame', () => {
        it('should call gamesService.createGame, logger.info and return result if all good', async () => {
            stub(gamesService, 'createGame').callsFake(() => {return {some: 'game data'}; });
            stub(logger, 'info');
            const mockGameData = {
                mode: GAME_STRINGS.MODES.CLASSIC,
                roundNumber: 1,
                opponent: GAME_STRINGS.OPPONENTS.COMPUTER
            };
            const res = await controller.createGame(mockGameData as any, {some: 'request data', user: {username: 'toto', userId: '666'}});
            return (expect(gamesService.createGame) as any).to.have.been.calledWith(mockGameData, '666')
                && (expect(logger.info) as any).to.have.been.called
                && (expect(res) as any).to.be.deep.eq({some: 'game data'});
        });

        it('should call logger.error if error', async () => {
            stub(gamesService, 'createGame').callsFake(() => Promise.reject('some error'));
            stub(logger, 'error');
            const mockGameData = {
                mode: GAME_STRINGS.MODES.CLASSIC,
                roundNumber: 1,
                opponent: GAME_STRINGS.OPPONENTS.COMPUTER
            };
            try {
                await controller.createGame(mockGameData as any, {some: 'request data', user: {username: 'toto', userId: '666'}});
                expect.fail();
            } catch (e) {
                return (expect(gamesService.createGame) as any).to.have.been.calledWith(mockGameData, '666')
                    && (expect(logger.error) as any).to.have.been.called;
            }
        });
    });

    describe('createGameMove', () => {
        it('should call gamesService.createGameMove, logger.info and return result if all good', async () => {
            stub(gamesService, 'createGameMove').callsFake(() => {return {some: 'game move data'}; });
            stub(logger, 'info');
            const mockGameMoveData = {
                gameId: '9999',
                round: 1,
                move: GAME_STRINGS.CHOICES.ROCK
            };
            const res = await controller.createGameMove(mockGameMoveData as any, {some: 'request data', user: {username: 'toto', userId: '666'}});
            return (expect(gamesService.createGameMove) as any).to.have.been.calledWith(mockGameMoveData, '666')
                && (expect(logger.info) as any).to.have.been.called
                && (expect(res) as any).to.be.deep.eq({some: 'game move data'});
        });

        it('should call logger.error if error', async () => {
            stub(gamesService, 'createGameMove').callsFake(() => Promise.reject('some error'));
            stub(logger, 'error');
            const mockGameMoveData = {
                gameId: '9999',
                round: 1,
                move: GAME_STRINGS.CHOICES.ROCK
            };
            try {
                await controller.createGameMove(mockGameMoveData as any, {some: 'request data', user: {username: 'toto', userId: '666'}});
                expect.fail();
            } catch (e) {
                return (expect(gamesService.createGameMove) as any).to.have.been.calledWith(mockGameMoveData, '666')
                    && (expect(logger.error) as any).to.have.been.called;
            }
        });
    })

});
