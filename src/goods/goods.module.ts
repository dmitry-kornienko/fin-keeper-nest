import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { Good, GoodShcema } from './good.shema';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Good.name, schema: GoodShcema}]),
    forwardRef(() => UsersModule),
    AuthModule
  ],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService]
})
export class GoodsModule {}
