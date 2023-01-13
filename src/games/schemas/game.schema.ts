import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Status } from '../interfaces/status.interface';
import { Round } from '../interfaces/round.interface';

@Schema()
export class Game extends Document {
    @Prop()
    status: Status;

    @Prop()
    roundNumber: number;

    @Prop()
    mode: string;

    @Prop()
    opponent: string;

    @Prop()
    creator: string;

    @Prop()
    rounds: Round[];

}

export const GameSchema = SchemaFactory.createForClass(Game);