import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Schema } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from 'src/goods/goods.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

export interface UpdateReportCostPriceData {
    article: string,
    cost_price: number
}

interface AddReportThroughExcelBody {
    dateFrom: string,
    dateTo: string,
    realizationreport_id: string,
}

@Controller('reports')
export class ReportsController {
    constructor(private reportService: ReportsService) {}

    @UseGuards(JwtAuthGuard)
    @Post('add')
    addReport(@Body() reportDto: CreateReportDto, @Req() req: AuthenticatedRequest) {
        return this.reportService.addReport(reportDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('add-through-excel')
    @UseInterceptors(FileInterceptor('file'))
    addReportThroughExcel(
        @UploadedFile() file: Express.Multer.File,
        @Body() data: AddReportThroughExcelBody,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportService.addThroughExcel(file.buffer, data.dateFrom, data.dateTo, data.realizationreport_id, req.user.id )
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAllUserReports(@Req() req: AuthenticatedRequest) {
        return this.reportService.getAllUserReports(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    getReport(@Param('id') id: Schema.Types.ObjectId) {
        return this.reportService.getOneReport(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/delete/:id')
    deleteOneReport(@Param('id') id: Schema.Types.ObjectId) {
        return this.reportService.deleteOneReport(id);
    }
    
    @UseGuards(JwtAuthGuard)
    @Patch('update-cost-pice/:id')
    updateCostPrice(@Body() data: UpdateReportCostPriceData[], @Param('id') id: Schema.Types.ObjectId) {
        return this.reportService.updateCostPrice(id, data)
    }
}
