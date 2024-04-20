import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcryptjs";
import { randomUUID } from 'crypto';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { UserTokenDto } from 'src/users/dto/user-token.dto';
import { User } from 'src/users/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private tokenService: TokensService,
                private jwtService: JwtService
            ) {}

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto);

        const userTokenDto = new UserTokenDto(user);
        const tokens = await this.tokenService.generateTokens({ ...userTokenDto });

        await this.tokenService.saveToken(user._id, tokens.refreshToken)

        return {
            ...tokens,
            user
        }
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException("Пользователь с таким email уже существует", HttpStatus.BAD_REQUEST)
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const activationLink = randomUUID();

        const user = await this.userService.createUser({...userDto, password: hashPassword, activationLink});

        const userTokenDto = new UserTokenDto(user);
        const tokens = await this.tokenService.generateTokens({ ...userTokenDto });
        await this.tokenService.saveToken(user._id, tokens.refreshToken)

        return {
            ...tokens,
            user
        }
    }

    async logout(refreshToken: string) {
        return await this.tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException({ message: "Некорректный email или пароль" });
        }
        const userData = await this.validateRefreshToken(refreshToken);
        const tokenFromDb = await this.tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw new UnauthorizedException({ message: "Пользователь не авторизован" });
        }

        const user = await this.userService.getUserById(userData.id);

        if (!user) {
            throw new HttpException(
                "Пользователь не найден.",
                HttpStatus.BAD_REQUEST
            );
        }

        const userTokenDto = new UserTokenDto(user);
        const tokens = await this.tokenService.generateTokens({ ...userTokenDto });

        await this.tokenService.saveToken(user._id, tokens.refreshToken)

        return {
            ...tokens,
            user
        }
    }

    private async generateToken(user: User) {
        const payload = { id: user._id, email: user.email };
        return this.jwtService.sign(payload)
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);
        if (!user) {
            throw new UnauthorizedException({ message: "Некорректный email или пароль" });
        }
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (user && passwordEquals) {
            return user;
        }
        throw new UnauthorizedException({ message: "Некорректный email или пароль" });
    }

    private async validateAccessToken(token: string) {
        const userData = await this.jwtService.verify(token, {
            secret: process.env.JWT_ACCESS_SECRET
        });
        if (!userData) {
            return null;
        }
        return userData;
    }
    private async validateRefreshToken(token: string) {
        const userData = await this.jwtService.verify(token, {
            secret: process.env.JWT_REFRESH_SECRET
        });
        if (!userData) {
            return null;
        }
        return userData;
    }
}
