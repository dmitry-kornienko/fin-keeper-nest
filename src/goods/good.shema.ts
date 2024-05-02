import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Good {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
    user: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    article: string;

    @Prop({ default: 0 })
    cost_price: number;
}

export const GoodShcema = SchemaFactory.createForClass(Good);