import { Injectable } from "@nestjs/common";
import { Model, Schema } from "mongoose";
import { Good } from "./good.shema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateGoodDto } from "./dto/create-good.dto";
import { UpdateGoodCostPriceData } from "./goods.controller";

@Injectable()
export class GoodsService {
    constructor(@InjectModel(Good.name) private goodModel: Model<Good>) {}

    async getUserGoods(userId: Schema.Types.ObjectId): Promise<Good[]> {
        return await this.goodModel.find({ user: userId });
    }

    async createGood(goodDto: CreateGoodDto): Promise<Good> {
        const newGood = new this.goodModel(goodDto);
        return newGood.save();
    }

    async updateCostPrice(data: UpdateGoodCostPriceData[]) {
        for (const item of data) {
            await this.goodModel.findOneAndUpdate({ _id: item.id }, { $set: { cost_price: item.cost_price } } );
        }
    }
}
