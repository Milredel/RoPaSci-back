import { UsersService } from './../users/users.service';
import { GamesService } from './games.service';
import { expect, stub, stubClass } from '../../src/test';
import { GAME_STRINGS } from './constants';

export class GameModel {
    creator: string;
    rounds: Array<any>;
    constructor(creator: string = null, rounds: Array<any> = []) {
        this.creator = creator;
        this.rounds = rounds;
    }
    find() { return { exec: () => null }}
    findOne() { return { exec: () => null}}
    save() { return null}
}

describe('GamesService', () => {
    let service: GamesService;
    let gameModel: GameModel;
    let _usersService;

    beforeEach(() => {
        service = new GamesService(
            gameModel = new GameModel() as any,
            _usersService = stubClass(UsersService)
        );
    });

    it('should init the service', () => {
        return expect(service).to.not.be.undefined;
    });

    describe('findAll', () => {
        it('should call gameModel.find() and _usersService.findById()', async () => {
            stub(gameModel, 'find').callsFake(() => {return { exec: () => [{some: 'game 1 data'}, {some: 'game 2 data'}] }; });
            stub(_usersService, 'findById').callsFake(() => {return {some: 'user data', username: 'toto'}; });
            await service.findAll();
            return (expect(gameModel.find) as any).to.have.been.called
                && (expect(_usersService.findById) as any).to.have.been.calledTwice;
        });
    });

    describe('findAllPending', () => {
        it('should call gameModel.find() and _usersService.findById()', async () => {
            stub(service, 'findAll').callsFake(() => {return [{status: {some: 'game 1 status data', status: GAME_STRINGS.STATUS.PENDING}}, {status: {some: 'game 2 status data', status: GAME_STRINGS.STATUS.ENDED}}]; });
            const res = await service.findAllPending();
            return (expect(service.findAll) as any).to.have.been.called
                && (expect(res) as any).to.be.deep.eq([{status: {some: 'game 1 status data', status: GAME_STRINGS.STATUS.PENDING}}]);
        });
    });

    describe('findById', () => {
        it('should call gameModel.find({_id: id})', () => {
            stub(gameModel, 'findOne');
            service.findById('666');
            return (expect(gameModel.findOne) as any).to.have.been.calledWith({_id: '666'});
        });
    });

    describe('createGame', () => {
        it('should call game.save()', () => {
            /* stub(gameModel, 'save');
            service.createGame({some: 'game data'} as any, '666');
            return (expect(gameModel.save) as any).to.have.been.called; */
            // TODO try to find how to properly mock gameModel
        });
    });

    describe('createGameMove', async () => {
        it('should throw error if no game found for given id', async () => {
            stub(service, 'findById').callsFake(() => null);
            try {
                await service.createGameMove({gameId: '1234'} as any, '666');
            } catch (e) {
                return (expect(e.message) as any).to.equal('Unable to find game with id 1234');
            }
        });

        it('should throw error if game found by creator different than requester', async () => {
            stub(service, 'findById').callsFake(() => {return {creator: '777'}; });
            try {
                await service.createGameMove({gameId: '1234'} as any, '666');
            } catch (e) {
                return (expect(e.message) as any).to.equal('You can\'t play this game');
            }
        });

        it('should throw error if already one move for the given round', async () => {
            stub(service, 'findById').callsFake(() => {return {creator: '666', rounds: [{creatorMove: {choice: GAME_STRINGS.CHOICES.ROCK}}]}; });
            try {
                await service.createGameMove({gameId: '1234', round: 1} as any, '666');
            } catch (e) {
                return (expect(e.message) as any).to.equal('Cannot play twice on same round');
            }
        });

        it('should call service.updateRoundResult() if everything is good', async () => {
            stub(service, 'findById').callsFake(() => {return new GameModel('666', []); });
            stub(service, 'updateRoundResult');
            await service.createGameMove({gameId: '1234', round: 1, move: GAME_STRINGS.CHOICES.PAPER} as any, '666');
            return (expect(service.updateRoundResult) as any).to.have.been.called;
        });
    });

    describe('updateRoundResult', () => {
        it('should do nothing if not creatorMove and not opponentMove', () => {
            stub(service, 'calculateRoundResult');
            stub(service, 'updateGameStatus');
            const res = service.updateRoundResult({rounds: [{creatorMove: 'some creator move data'}]} as any, 0);
            return (expect(service.calculateRoundResult) as any).to.not.have.been.called
                && (expect(service.updateGameStatus) as any).to.not.have.been.called
                && (expect(res) as any).to.be.deep.eq({rounds: [{creatorMove: 'some creator move data'}]});
        });

        it('should call service.calculateRoundResult and updateGameStatus if creatorMove and opponentMove', () => {
            stub(service, 'calculateRoundResult');
            stub(service, 'updateGameStatus');
            service.updateRoundResult({rounds: [{creatorMove: 'some creator move data', opponentMove: 'some opponent move data'}]} as any, 0);
            return (expect(service.calculateRoundResult) as any).to.have.been.called
                && (expect(service.updateGameStatus) as any).to.have.been.called
        });
    });

    describe('calculateRoundResult', () => {
        it('should return correct result for the round', () => {
            const mockedRound = {
                creatorMove: {choice: GAME_STRINGS.CHOICES.PAPER},
                opponentMove: {choice: GAME_STRINGS.CHOICES.SCISSORS}
            };
            const mockedGame = {
                mode: GAME_STRINGS.MODES.CLASSIC,
                rounds: [
                    mockedRound
                ]
            };
            const res = service.calculateRoundResult(mockedGame as any, mockedRound as any);
            return (expect(res) as any).to.equal('opponent');
        });
    });

    describe('updateGameStatus', () => {
        it('should update score if needed', () => {
            const mockedRound = {
                creatorMove: {choice: GAME_STRINGS.CHOICES.PAPER},
                opponentMove: {choice: GAME_STRINGS.CHOICES.SCISSORS},
                winner: GAME_STRINGS.WINNERS.OPPONENT
            };
            const mockedGame = {
                mode: GAME_STRINGS.MODES.CLASSIC,
                rounds: [
                    mockedRound
                ],
                status: {
                    currentRound: 1,
                    score: {
                        creator: 0,
                        opponent: 0
                    }
                }
            };
            const res = service.updateGameStatus(mockedGame as any, mockedRound as any);
            return (expect(res) as any).to.be.deep.eq({
                mode: GAME_STRINGS.MODES.CLASSIC,
                rounds: [
                    mockedRound
                ],
                status: {
                    currentRound: 2,
                    score: {
                        creator: 0,
                        opponent: 1
                    }
                }
            });
        });

        it('should update game status if needed', () => {
            const mockedRound = {
                creatorMove: {choice: GAME_STRINGS.CHOICES.PAPER},
                opponentMove: {choice: GAME_STRINGS.CHOICES.SCISSORS},
                winner: GAME_STRINGS.WINNERS.OPPONENT
            };
            const mockedGame = {
                mode: GAME_STRINGS.MODES.CLASSIC,
                roundNumber: 1,
                rounds: [
                    mockedRound
                ],
                status: {
                    currentRound: 1,
                    score: {
                        creator: 0,
                        opponent: 0
                    }
                }
            };
            const res = service.updateGameStatus(mockedGame as any, mockedRound as any);
            delete res.status.endedAt; // because we cannot predict exact hour
            return (expect(res) as any).to.be.deep.eq({
                mode: GAME_STRINGS.MODES.CLASSIC,
                roundNumber: 1,
                rounds: [
                    mockedRound
                ],
                status: {
                    currentRound: 2,
                    score: {
                        creator: 0,
                        opponent: 1
                    },
                    winner: GAME_STRINGS.WINNERS.OPPONENT,
                    status: GAME_STRINGS.STATUS.ENDED
                }
            });
        });
    });

    describe('calculateGameResult', () => {
        it('should return draw if draw', () => {
            const res = service.calculateGameResult({score: {creator: 1, opponent: 1}} as any);
            return (expect(res) as any).to.equal(GAME_STRINGS.WINNERS.DRAW);
        });

        it('should return creator if creator has won', () => {
            const res = service.calculateGameResult({score: {creator: 2, opponent: 1}} as any);
            return (expect(res) as any).to.equal(GAME_STRINGS.WINNERS.CREATOR);
        });

        it('should return opponent if creator has lost', () => {
            const res = service.calculateGameResult({score: {creator: 2, opponent: 3}} as any);
            return (expect(res) as any).to.equal(GAME_STRINGS.WINNERS.OPPONENT);
        });
    });
});
