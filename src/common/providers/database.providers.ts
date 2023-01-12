
import * as mongoose from 'mongoose';
import { DATABASE_CONNECTION } from '../constants';

export const databaseProviders = [
    {
        provide: DATABASE_CONNECTION,
        useFactory: (): Promise<typeof mongoose> => {
            return mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
        }
    },
];