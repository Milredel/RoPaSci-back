import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import * as bcrypt from 'bcrypt';

@Schema()
export class User extends Document {
    @Prop()
    id: number;

    @Prop()
    username: string;

    @Prop()
    password: string;

    async comparePassword(attempt: string): Promise<boolean> {
        return true;
        // return await bcrypt.compare(attempt, this.password);
    }

}

export const UserSchema = SchemaFactory.createForClass(User);