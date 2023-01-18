import { GameWinnersTypes } from "./enums/winners.enum";

export const RESULT_CHECKER = {
    'classic': {
        'rock' : {
            'rock' : GameWinnersTypes.DRAW,
            'scissors' : GameWinnersTypes.CREATOR,
            'paper' : GameWinnersTypes.OPPONENT
        },
        'scissors' : {
            'rock' : GameWinnersTypes.OPPONENT,
            'scissors' : GameWinnersTypes.DRAW,
            'paper' : GameWinnersTypes.CREATOR
        },
        'paper' : {
            'rock' : GameWinnersTypes.CREATOR,
            'scissors' : GameWinnersTypes.OPPONENT,
            'paper' : GameWinnersTypes.DRAW
        }
    },
    'french': {
        'rock' : {
            'rock' : GameWinnersTypes.DRAW,
            'scissors' : GameWinnersTypes.CREATOR,
            'paper' : GameWinnersTypes.OPPONENT,
            'well': GameWinnersTypes.OPPONENT
        },
        'scissors' : {
            'rock' : GameWinnersTypes.OPPONENT,
            'scissors' : GameWinnersTypes.DRAW,
            'paper' : GameWinnersTypes.CREATOR,
            'well': GameWinnersTypes.OPPONENT
        },
        'paper' : {
            'rock' : GameWinnersTypes.CREATOR,
            'scissors' : GameWinnersTypes.OPPONENT,
            'paper' : GameWinnersTypes.DRAW,
            'well': GameWinnersTypes.CREATOR
        },
        'well': {
            'rock' : GameWinnersTypes.CREATOR,
            'scissors' : GameWinnersTypes.CREATOR,
            'paper' : GameWinnersTypes.OPPONENT,
            'well': GameWinnersTypes.DRAW
        }
    },
    'star_trek': {
        'rock' : {
            'rock' : GameWinnersTypes.DRAW,
            'scissors' : GameWinnersTypes.CREATOR,
            'paper' : GameWinnersTypes.OPPONENT,
            'lizard': GameWinnersTypes.CREATOR,
            'spock': GameWinnersTypes.OPPONENT
        },
        'scissors' : {
            'rock' : GameWinnersTypes.OPPONENT,
            'scissors' : GameWinnersTypes.DRAW,
            'paper' : GameWinnersTypes.CREATOR,
            'lizard': GameWinnersTypes.CREATOR,
            'spock': GameWinnersTypes.OPPONENT
        },
        'paper' : {
            'rock' : GameWinnersTypes.CREATOR,
            'scissors' : GameWinnersTypes.OPPONENT,
            'paper' : GameWinnersTypes.DRAW,
            'lizard': GameWinnersTypes.OPPONENT,
            'spock': GameWinnersTypes.CREATOR
        },
        'lizard': {
            'rock' : GameWinnersTypes.OPPONENT,
            'scissors' : GameWinnersTypes.OPPONENT,
            'paper' : GameWinnersTypes.CREATOR,
            'lizard': GameWinnersTypes.DRAW,
            'spock': GameWinnersTypes.CREATOR
        },
        'spock': {
            'rock' : GameWinnersTypes.CREATOR,
            'scissors' : GameWinnersTypes.CREATOR,
            'paper' : GameWinnersTypes.OPPONENT,
            'lizard': GameWinnersTypes.OPPONENT,
            'spock': GameWinnersTypes.DRAW
        }
    }
};

export { GameModesTypes } from './enums/modes.enum';
export { GameMovesTypes } from './enums/moves.enum';
export { GameOpponentsTypes } from './enums/opponents.enum';
export { GameStatusTypes } from './enums/status.enum';
export { GameWinnersTypes } from './enums/winners.enum';
