import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from 'src/goods/goods.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
    constructor(private reportService: ReportsService) {}

    @UseGuards(JwtAuthGuard)
    @Post('add')
    addReport(@Body() reportDto: CreateReportDto, @Req() req: AuthenticatedRequest) {
        return this.reportService.addReport(reportDto, req.user.id);
    }
}
