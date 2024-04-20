import { Body, Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll() {
        return this.userService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Get("/current")
    current(@Body() id: string) {
        return this.userService.getUserById(id)
    }

    @Get('/activate/:link')
    async activate(@Param('link') link: string,  @Res() res: Response) {
        await this.userService.activate(link);
        return res.redirect(process.env.CLIENT_URL)
    }
}
