import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    async login(@Body() userDto: CreateUserDto, @Res() res: Response) {
        const loginData = await this.authService.login(userDto);

        res.cookie("refreshToken", loginData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 100, httpOnly: true });

        return res.status(201).json(loginData);
    }

    @Post('/registration')
    async registration(@Body() userDto: CreateUserDto, @Res() res: Response, @Req() req: Request) {
        const registrationData = await this.authService.registration(userDto);

        res.cookie("refreshToken", registrationData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 100, httpOnly: true });

        return res.status(201).json(registrationData);
    }
    
    @Post('/logout')
    async logout(@Res() res: Response, @Req() req: Request) {
        const {refreshToken} = req.cookies;
        const token = await this.authService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.status(200).json(token)
    }

    @Get('/refresh')
    async refresh(@Res() res: Response, @Req() req: Request) {
        const {refreshToken} = req.cookies;
        
        const refreshData = await this.authService.refresh(refreshToken);

        res.cookie("refreshToken", refreshData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 100, httpOnly: true });

        return res.status(201).json(refreshData);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/current")
    current(@Req() req) {
        return this.authService.current(req.user.id);
    }
}
