import { Connection, Model } from 'mongoose';
import { GameSchema, Game } from './schemas/game.schema';
import { GAME_MODEL_IDENTIFIER, DATABASE_CONNECTION } from 'src/common/constants';

export const gameProviders = [
    {
        provide: GAME_MODEL_IDENTIFIER,
        useFactory: (connection: Connection): Model<Game> => connection.model('Game', GameSchema, 'game'),
        inject: [DATABASE_CONNECTION],
    },
];