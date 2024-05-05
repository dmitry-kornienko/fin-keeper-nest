import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { GoodsModule } from 'src/goods/goods.module';
import { Report, ReportSchema } from './report.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Good, GoodShcema } from 'src/goods/good.shema';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Report.name, schema: ReportSchema}]),
    MongooseModule.forFeature([{name: Good.name, schema: GoodShcema}]),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    GoodsModule,
    AuthModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
