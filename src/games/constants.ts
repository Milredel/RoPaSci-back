export const RESULT_CHECKER = {
    'classic': {
        'rock' : {
            'rock' : 'draw',
            'scissors' : 'creator',
            'paper' : 'opponent'
        },
        'scissors' : {
            'rock' : 'opponent',
            'scissors' : 'draw',
            'paper' : 'creator'
        },
        'paper' : {
            'rock' : 'creator',
            'scissors' : 'opponent',
            'paper' : 'draw'
        }
    },
    'french': {
        'rock' : {
            'rock' : 'draw',
            'scissors' : 'creator',
            'paper' : 'opponent',
            'well': 'opponent'
        },
        'scissors' : {
            'rock' : 'opponent',
            'scissors' : 'draw',
            'paper' : 'creator',
            'well': 'opponent'
        },
        'paper' : {
            'rock' : 'creator',
            'scissors' : 'opponent',
            'paper' : 'draw',
            'well': 'creator'
        },
        'well': {
            'rock' : 'creator',
            'scissors' : 'creator',
            'paper' : 'opponent',
            'well': 'draw'
        }
    },
    'star_trek': {
        'rock' : {
            'rock' : 'draw',
            'scissors' : 'creator',
            'paper' : 'opponent',
            'lizard': 'creator',
            'spock': 'opponent'
        },
        'scissors' : {
            'rock' : 'opponent',
            'scissors' : 'draw',
            'paper' : 'creator',
            'lizard': 'creator',
            'spock': 'opponent'
        },
        'paper' : {
            'rock' : 'creator',
            'scissors' : 'opponent',
            'paper' : 'draw',
            'lizard': 'opponent',
            'spock': 'creator'
        },
        'lizard': {
            'rock' : 'opponent',
            'scissors' : 'opponent',
            'paper' : 'creator',
            'lizard': 'draw',
            'spock': 'creator'
        },
        'spock': {
            'rock' : 'creator',
            'scissors' : 'creator',
            'paper' : 'opponent',
            'lizard': 'opponent',
            'spock': 'draw'
        }
    }
};