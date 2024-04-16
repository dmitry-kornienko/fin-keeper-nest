import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema()
export class Token {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
    user: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    refreshToken: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);