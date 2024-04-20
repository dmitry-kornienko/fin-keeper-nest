import { Schema } from 'mongoose';
import { User } from "../user.schema";

export class UserTokenDto {
    email: string;
    isActivated: boolean;
    id: Schema.Types.ObjectId;

    constructor(model: User) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}