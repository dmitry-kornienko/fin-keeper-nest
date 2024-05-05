import { Injectable } from "@nestjs/common";
import { Model, Schema } from "mongoose";
import { Good } from "./good.shema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateGoodDto } from "./dto/create-good.dto";

@Injectable()
export class GoodsService {
    constructor(@InjectModel(Good.name) private goodModel: Model<Good>) {}

    async createGood(goodDto: CreateGoodDto): Promise<Good> {
        const newGood = new this.goodModel(goodDto);
        return newGood.save();
    }

    async getUserGoods(userId: Schema.Types.ObjectId): Promise<Good[]> {
        return await this.goodModel.find({ user: userId });
    }
}
