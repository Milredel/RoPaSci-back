import { Connection, Model } from 'mongoose';
import { UserSchema, User } from './schemas/user.schema';
import { USER_MODEL_IDENTIFIER, DATABASE_CONNECTION } from 'src/common/constants';

export const userProviders = [
    {
        provide: USER_MODEL_IDENTIFIER,
        useFactory: (connection: Connection): Model<User> => connection.model('User', UserSchema, 'user'),
        inject: [DATABASE_CONNECTION],
    },
];