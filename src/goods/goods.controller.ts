import { Body, Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserTokenDto } from 'src/users/dto/user-token.dto';

export interface AuthenticatedRequest extends Request {
    user: UserTokenDto;
}

@Controller('goods')
export class GoodsController {

    constructor(private goodsService: GoodsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    getUserGoods(@Req() req: AuthenticatedRequest) {
        return this.goodsService.getUserGoods(req.user.id);
    }
}
