import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    async login(@Body() userDto: CreateUserDto) {
        return this.authService.login(userDto);
    }

    @Post('/registration')
    async registration(@Body() userDto: CreateUserDto, @Res() res: Response, @Req() req: Request) {
        const registrationData = await this.authService.registration(userDto);

        res.cookie("refreshToken", registrationData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 100, httpOnly: true });

        return res.status(201).json(registrationData);
    }

    @Get('/refresh')
    async refresh() {
        
    }
}
