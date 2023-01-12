import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Game extends Document {
    @Prop()
    id: number;

    @Prop()
    status: string;

    @Prop()
    roundNumber: number;

    @Prop()
    mode: string;

    @Prop()
    opponent: string;

    @Prop()
    creator: number;

}

export const GameSchema = SchemaFactory.createForClass(Game);