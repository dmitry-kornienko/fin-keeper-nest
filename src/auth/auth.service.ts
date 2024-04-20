import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcryptjs";
import { randomUUID } from 'crypto';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { TokensService } from 'src/tokens/tokens.service';
import { UserTokenDto } from 'src/users/dto/user-token.dto';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private tokenService: TokensService,
            ) {}

    async login(userDto: CreateUserDto) {
        // const user = await this.validateUser(userDto);
        // const token = await this.generateToken(user);

        // const response = {
        //     _id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     password: user.password,
        //     token,
        //     tokenWB: user.tokenWB,
        //     bill: user.bill,
        // }
        // return response;
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

    async logout() {
        
    }

    async refresh() {

    }

    async activate() {
        
    }

    // private async generateToken(user: User) {
    //     const payload = { id: user._id, email: user.email };
    //     return this.jwtService.sign(payload)
    // }

    // private async validateUser(userDto: CreateUserDto) {
    //     const user = await this.userService.getUserByEmail(userDto.email);
    //     const passwordEquals = await bcrypt.compare(userDto.password, user.password);
    //     if (user && passwordEquals) {
    //         return user;
    //     }
    //     throw new UnauthorizedException({ message: "Некорректный email или пароль" });
    // }

    // private async sendActivationMail(to: string, link: string) {

    // }
}
