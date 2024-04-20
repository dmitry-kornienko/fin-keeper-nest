import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Schema } from "mongoose";
import { Token } from "./token.schema";
import { UserTokenDto } from "src/users/dto/user-token.dto";

@Injectable()
export class TokensService {
    constructor(
        @InjectModel(Token.name) private tokenModel: Model<Token>,
        private jwtService: JwtService,
    ) {}

    async generateTokens(payload: UserTokenDto) {
        const accessToken = this.jwtService.sign(payload, { expiresIn: "30s", secret: process.env.JWT_ACCESS_SECRET });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: "30d", secret: process.env.JWT_REFRESH_SECRET });

        return {
            accessToken,
            refreshToken,
        };
    }

    async saveToken(userId: Schema.Types.ObjectId, refreshToken: string) {

        const tokenData = await this.getTokenByUserId(userId);

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        const newTokenData = new this.tokenModel({ user: userId, refreshToken });
        await newTokenData.save();

        return newTokenData;
    }

    async getTokenByUserId(userId: Schema.Types.ObjectId) {
        const token = await this.tokenModel.findOne({ user: userId });
        return token;
    }

    async removeToken(refreshToken: string) {
        const tokenData = await this.tokenModel.deleteOne({ refreshToken });
        if (!tokenData.deletedCount) {
            throw new HttpException("Не удалось удалить токен", HttpStatus.BAD_REQUEST)
        }
        return tokenData;
    }

    async findToken(refreshToken: string) {
        const tokenData = await this.tokenModel.findOne({ refreshToken });
        if (!tokenData) {
            throw new HttpException("Не удалось найти токен", HttpStatus.BAD_REQUEST)
        }
        return tokenData;
    }
}
