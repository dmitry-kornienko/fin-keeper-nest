import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env"
        }),
        MongooseModule.forRoot(process.env.DATA_BASE_URL),
        UsersModule,
        AuthModule,
        TokensModule,
    ],
    controllers: [],
    providers: []
})
export class AppModule {}