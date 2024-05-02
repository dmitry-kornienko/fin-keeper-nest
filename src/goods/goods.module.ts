import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { Good, GoodShcema } from './good.shema';

@Module({
  imports: [MongooseModule.forFeature([{name: Good.name, schema: GoodShcema}])],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService]
})
export class GoodsModule {}
