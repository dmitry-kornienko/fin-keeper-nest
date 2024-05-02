import { Schema } from "mongoose";

export class CreateGoodDto {
    readonly article: string;
    readonly cost_price: number;
    readonly user: Schema.Types.ObjectId;
}