import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {

    @Prop()
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: false })
    password: string;

    @Prop({ default: "" })
    tokenWB: string;

    @Prop({ default: 5 })
    bill: number;

    _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);