import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserTokenDto } from 'src/users/dto/user-token.dto';
import { Schema } from 'mongoose';

export interface AuthenticatedRequest extends Request {
    user: UserTokenDto;
}

export interface UpdateGoodCostPriceData {
    id: Schema.Types.ObjectId,
    cost_price: number
}

@Controller('goods')
export class GoodsController {

    constructor(private goodsService: GoodsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    getUserGoods(@Req() req: AuthenticatedRequest) {
        return this.goodsService.getUserGoods(req.user.id);
    }

    @Patch('edit')
    updateCostPrice(@Body() data: UpdateGoodCostPriceData[]) {
        return this.goodsService.updateCostPrice(data)
    }
}
