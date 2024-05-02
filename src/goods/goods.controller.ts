import { Body, Controller, Get } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { Schema } from 'mongoose';

@Controller('goods')
export class GoodsController {

    constructor(private goodsService: GoodsService) {}

    @Get()
    getUserGoods(@Body() userId: Schema.Types.ObjectId) {
        return this.goodsService.getUserGoods(userId);
    }
}
