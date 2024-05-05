import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { GoodsModule } from './goods/goods.module';
import { ReportsModule } from './reports/reports.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env"
        }),
        MongooseModule.forRoot(process.env.DATA_BASE_URL),
        UsersModule,
        AuthModule,
        TokensModule,
        GoodsModule,
        ReportsModule,
    ],
    controllers: [],
    providers: []
})
export class AppModule {}