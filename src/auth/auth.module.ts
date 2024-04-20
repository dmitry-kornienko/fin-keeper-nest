import { Module, forwardRef } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { TokensModule } from "src/tokens/tokens.module";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
            secret: process.env.JWT_SECRET || "SECRET",
            signOptions: {
                expiresIn: "24h"
            }
        }),
        TokensModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [
        AuthService,
        JwtModule
    ]
})
export class AuthModule {}
