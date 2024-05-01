import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
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

    @Get('/activate/:link')
    async activate(@Param('link') link: string,  @Res() res: Response) {
        await this.userService.activate(link);
        return res.redirect(process.env.CLIENT_URL)
    }
}
