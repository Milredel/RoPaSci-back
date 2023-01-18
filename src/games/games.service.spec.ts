import { UsersService } from './../users/users.service';
import { GamesService } from './games.service';
import { expect, stub, stubClass } from '../../src/test';
import { GameModesTypes, GameMovesTypes, GameStatusTypes, GameWinnersTypes } from './constants';

export class GameModel { // this is clearly not the way to do it !
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
            stub(service, 'findAll').callsFake(() => {return [{status: {some: 'game 1 status data', status: GameStatusTypes.PENDING}}, {status: {some: 'game 2 status data', status: GameStatusTypes.ENDED}}]; });
            const res = await service.findAllPending();
            return (expect(service.findAll) as any).to.have.been.called
                && (expect(res) as any).to.be.deep.eq([{status: {some: 'game 1 status data', status: GameStatusTypes.PENDING}}]);
        });
    });

    describe('findEndedGames', () => {
        it('should call gameModel.find() and _usersService.findById() without page and limit if not given', async () => {
            stub(gameModel, 'find').callsFake(() => {return { exec: () => [{some: 'game 1 data'}, {some: 'game 2 data'}] }; });
            stub(_usersService, 'findById').callsFake(() => {return {some: 'user data', username: 'toto'}; });
            await service.findEndedGames('666');
            return (expect(gameModel.find) as any).to.have.been.calledWith({'status.status': GameStatusTypes.ENDED, 'creator': '666'}, null, {sort: {'status.createdAt': -1}})
                && (expect(_usersService.findById) as any).to.have.been.calledTwice;
        });

        it('should call gameModel.find() and _usersService.findById() with page and limit if given', async () => {
            stub(gameModel, 'find').callsFake(() => {return { exec: () => [{some: 'game 1 data'}, {some: 'game 2 data'}] }; });
            stub(_usersService, 'findById').callsFake(() => {return {some: 'user data', username: 'toto'}; });
            await service.findEndedGames('666', 0, 5);
            return (expect(gameModel.find) as any).to.have.been.calledWith({'status.status': GameStatusTypes.ENDED, 'creator': '666'}, null, {sort: {'status.createdAt': -1}, limit: 5, skip: 0})
                && (expect(_usersService.findById) as any).to.have.been.calledTwice;
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
            stub(service, 'findById').callsFake(() => {return {creator: '666', rounds: [{creatorMove: {choice: GameMovesTypes.ROCK}}]}; });
            try {
                await service.createGameMove({gameId: '1234', round: 1} as any, '666');
            } catch (e) {
                return (expect(e.message) as any).to.equal('Cannot play twice on same round');
            }
        });

        it('should call service.updateRoundResult() if everything is good', async () => {
            stub(service, 'findById').callsFake(() => {return new GameModel('666', []); });
            stub(service, 'updateRoundResult');
            await service.createGameMove({gameId: '1234', round: 1, move: GameMovesTypes.PAPER} as any, '666');
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
                creatorMove: {choice: GameMovesTypes.PAPER},
                opponentMove: {choice: GameMovesTypes.SCISSORS}
            };
            const mockedGame = {
                mode: GameModesTypes.CLASSIC,
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
                creatorMove: {choice: GameMovesTypes.PAPER},
                opponentMove: {choice: GameMovesTypes.SCISSORS},
                winner: GameWinnersTypes.OPPONENT
            };
            const mockedGame = {
                mode: GameModesTypes.CLASSIC,
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
                mode: GameModesTypes.CLASSIC,
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

        it('should update score if needed when draw', () => {
            const mockedRound = {
                creatorMove: {choice: GameMovesTypes.SCISSORS},
                opponentMove: {choice: GameMovesTypes.SCISSORS},
                winner: GameWinnersTypes.DRAW
            };
            const mockedGame = {
                mode: GameModesTypes.CLASSIC,
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
                mode: GameModesTypes.CLASSIC,
                rounds: [
                    mockedRound
                ],
                status: {
                    currentRound: 2,
                    score: {
                        creator: 1,
                        opponent: 1
                    }
                }
            });
        });

        it('should update game status if needed', () => {
            const mockedRound = {
                creatorMove: {choice: GameMovesTypes.PAPER},
                opponentMove: {choice: GameMovesTypes.SCISSORS},
                winner: GameWinnersTypes.OPPONENT
            };
            const mockedGame = {
                mode: GameModesTypes.CLASSIC,
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
                mode: GameModesTypes.CLASSIC,
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
                    winner: GameWinnersTypes.OPPONENT,
                    status: GameStatusTypes.ENDED
                }
            });
        });
    });

    describe('calculateGameResult', () => {
        it('should return draw if draw', () => {
            const res = service.calculateGameResult({score: {creator: 1, opponent: 1}} as any);
            return (expect(res) as any).to.equal(GameWinnersTypes.DRAW);
        });

        it('should return creator if creator has won', () => {
            const res = service.calculateGameResult({score: {creator: 2, opponent: 1}} as any);
            return (expect(res) as any).to.equal(GameWinnersTypes.CREATOR);
        });

        it('should return opponent if creator has lost', () => {
            const res = service.calculateGameResult({score: {creator: 2, opponent: 3}} as any);
            return (expect(res) as any).to.equal(GameWinnersTypes.OPPONENT);
        });
    });

    describe('computeStats', () => {
        it('should return correct stats from given games', async () => {
            stub(service, 'findEndedGames').callsFake(() => { return [
                {some: 'game 1 data', mode: GameModesTypes.CLASSIC, status: {winner: GameWinnersTypes.CREATOR, createdAt: new Date('2023-01-18 16:00:00'), endedAt: new Date('2023-01-18 16:01:00')}},
                {some: 'game 2 data', mode: GameModesTypes.CLASSIC, status: {winner: GameWinnersTypes.DRAW, createdAt: new Date('2023-01-18 16:10:00'), endedAt: new Date('2023-01-18 16:10:30')}},
                {some: 'game 3 data', mode: GameModesTypes.FRENCH, status: {winner: GameWinnersTypes.CREATOR, createdAt: new Date('2023-01-18 16:20:00'), endedAt: new Date('2023-01-18 16:20:45')}},
                {some: 'game 4 data', mode: GameModesTypes.STAR_TREK, status: {winner: GameWinnersTypes.OPPONENT, createdAt: new Date('2023-01-18 16:30:00'), endedAt: new Date('2023-01-18 16:30:45')}}
            ]});
            stub(service, 'findAllPending').callsFake(() => { return [{some: 'game 5 data'}, {some: 'game 6 data'}]});
            const res = await service.computeStats('666');
            return (expect(res) as any).to.be.deep.eq({
                totalPlayedGames: 4,
                playedByModes: {
                    classic: 2,
                    french: 1,
                    star_trek: 1
                },
                totalPendingGames: 2,
                totalScoreVsComputer: {
                    win: 2,
                    lose: 1,
                    draw: 1
                },
                averageTime: 45000
            });
        });
    });
});
