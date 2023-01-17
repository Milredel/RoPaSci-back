import {Inject, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {USER_MODEL_IDENTIFIER} from '../common/constants';
import {User} from './interfaces/user.interface';

@Injectable()
export class UsersService {

    constructor(
        @Inject(USER_MODEL_IDENTIFIER) private userModel: Model<User>,
    ) {
    }

    /**
     * Find all users
     *
     * @returns {Promise<any[]>}
     * @memberof UsersService
     */
    async findAll(): Promise<any[]> {
        const userListFull = await this.userModel.find().exec();
        const userListLight = userListFull.map(u => {
            return {
                username: u.username,
                id: u._id,
            }
        });
        return userListLight;
    }

    /**
     * Find one User by its username
     *
     * @param {string} username
     * @returns {Promise<User[]>}
     * @memberof UsersService
     */
    async findByUsername(username: string): Promise<User[]> {
        return this.userModel.find({username: username}).exec();
    }

    /**
     * Find one user by its id
     *
     * @param {string} id
     * @returns {Promise<User>}
     * @memberof UsersService
     */
    async findById(id: string): Promise<User> {
        return this.userModel.findOne({_id: id}).exec();
    }
}
