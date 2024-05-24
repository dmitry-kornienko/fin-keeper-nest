import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import axios from 'axios';
import * as xlsx from 'xlsx';
import { Report } from './report.schema';
import { Good } from 'src/goods/good.shema';
import { CreateReportDto } from './dto/create-report.dto';
import { GoodsService } from 'src/goods/goods.service';
import { User } from 'src/users/user.schema';
import { UpdateReportCostPriceData } from './reports.controller';

interface FetchReportRequest {
    method: string;
    url: string;
    headers: {
        Authorization: string;
    };
}

export interface FetchResponse {
    realizationreport_id: number
    date_from: string
    date_to: string
    create_dt: string
    currency_name: string
    suppliercontract_code: any
    rrd_id: number
    gi_id: number
    subject_name: string
    nm_id: number
    brand_name: string
    sa_name: string
    ts_name: string
    barcode: string
    doc_type_name: string
    quantity: number
    retail_price: number
    retail_amount: number
    sale_percent: number
    commission_percent: number
    office_name: string
    supplier_oper_name: string
    order_dt: string
    sale_dt: string
    rr_dt: string
    shk_id: number
    retail_price_withdisc_rub: number
    delivery_amount: number
    return_amount: number
    delivery_rub: number
    gi_box_type_name: string
    product_discount_for_report: number
    supplier_promo: number
    rid: number
    ppvz_spp_prc: number
    ppvz_kvw_prc_base: number
    ppvz_kvw_prc: number
    sup_rating_prc_up: number
    is_kgvp_v2: number
    ppvz_sales_commission: number
    ppvz_for_pay: number
    ppvz_reward: number
    acquiring_fee: number
    acquiring_bank: string
    ppvz_vw: number
    ppvz_vw_nds: number
    ppvz_office_id: number
    ppvz_office_name: string
    ppvz_supplier_id: number
    ppvz_supplier_name: string
    ppvz_inn: string
    declaration_number: string
    bonus_type_name: string
    sticker_id: string
    site_country: string
    penalty: number
    additional_payment: number
    rebill_logistic_cost: number
    rebill_logistic_org: string
    kiz: string
    storage_fee: number
    deduction: number
    acceptance: number
    srid: string
    report_type: number
}

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<Report>,
        @InjectModel(Good.name) private goodModel: Model<Good>,
        @InjectModel(User.name) private userModel: Model<User>,
        private goodService: GoodsService
    ) {}

    async addReport(reportDto: CreateReportDto, userId: Schema.Types.ObjectId) {

        const user = await this.userModel.findOne({ _id: userId });
        
        if (!user) {
            throw new UnauthorizedException({ message: "Пользователь не найден" });
        }

        if (user.bill <= 0) {
            throw new HttpException('Не достаточно средств на балансе', HttpStatus.BAD_REQUEST);
        }

        const config = {
            method: 'get',
            url: `https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod?dateFrom=${reportDto.date_from}&dateTo=${reportDto.date_to}`,
            headers: {
                'Authorization': user.tokenWB
            }
        }

        try {
            const data = await this.fetchReport(config);
            
            const goods = await this.goodModel.find({ user });

            const report = await this.getReport(data, reportDto.date_from, reportDto.date_to, goods, user);
            
            const addedReport = await this.getReportById(report.realizationreport_id);

            if (addedReport) {
                throw new HttpException('Отчет с таким номер уже существует', HttpStatus.BAD_REQUEST)
            }
            const newReport = new this.reportModel(report);
            await this.userModel.findOneAndUpdate({ _id: userId }, { $inc: { bill: -1 } });

            return newReport.save();
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async getAllUserReports(userId: Schema.Types.ObjectId): Promise<Report[]> {
        return this.reportModel.find({ user: userId });
    }

    async getOneReport(id: Schema.Types.ObjectId): Promise<Report> {
        return this.reportModel.findOne({ _id: id });
    }

    async deleteOneReport(id: Schema.Types.ObjectId) {
        const deletedData = await this.reportModel.findOneAndDelete({ _id: id });

        if (!deletedData) {
            throw new HttpException("Отчет не найден", HttpStatus.BAD_REQUEST)
        }
    }

    async updateCostPrice(reportId: Schema.Types.ObjectId, data: UpdateReportCostPriceData[]) {

        const report = await this.reportModel.findOne({  _id: reportId});

        if (!report) {
            throw new HttpException("Отчет не найден", HttpStatus.BAD_REQUEST);
        }

        const updates = data.map(i => ({
            updateOne: {
                filter: { 'composition.article': i.article },
                update: { $set: { 'composition.$.cost_price': i.cost_price } }
            }
        }));
    
        await this.reportModel.bulkWrite(updates);
    }

    async addThroughExcel(buffer: Buffer, dateFrom: string, dateTo: string, realizationreport_id: string, userId: Schema.Types.ObjectId) {
        
        if (!buffer || !dateFrom || !dateTo || !realizationreport_id) {
            throw new BadRequestException('Пожалуйста, укажите все данные отчета');
        }
        
        const user = await this.userModel.findOne({ _id: userId });

        if (!user) {
            throw new UnauthorizedException({ message: "Пользователь не найден" });
        }

        if (user.bill <= 0) {
            throw new HttpException('Не достаточно средств на балансе', HttpStatus.BAD_REQUEST);
        }

        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const data: unknown[][] = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });

        if (data.length === 0) {
            throw new BadRequestException('Пустой файл Excel');
        }

        const columns = data[0] as string[];
        const rows = data.slice(1) as unknown[][];

        const objectsArray = rows.map(row => {
            const obj: { [key: string]: any } = {};
            columns.forEach((column, index) => {
                obj[column] = row[index];
            });
            return obj;
        });

        const detalization = this.getDataForExcelAddingReport({ arr: objectsArray, dateFrom: dateFrom, dateTo: dateTo, realizationreport_id: realizationreport_id })

        const goods = await this.goodModel.find({ user });

        const report = await this.getReport(detalization, dateFrom, dateTo, goods, user);
            
        const addedReport = await this.getReportById(report.realizationreport_id);

        if (addedReport) {
            throw new HttpException('Отчет с таким номер уже существует', HttpStatus.BAD_REQUEST)
        }

        const newReport = new this.reportModel(report);
        await this.userModel.findOneAndUpdate({ _id: userId }, { $inc: { bill: -1 } });
        return newReport.save();
    }

    private async getReportById(id: number) {
        return await this.reportModel.findOne({ realizationreport_id: id });
    }

    private async fetchReport(config: FetchReportRequest): Promise<FetchResponse[]> {
        const response = await axios(config);

        const transformedData = response.data.map((item: FetchResponse) => ({
            ...item,
            doc_type_name: item.doc_type_name.toLowerCase(),
            supplier_oper_name: item.supplier_oper_name.toLowerCase(),
            sa_name: item.sa_name.toLocaleLowerCase(),
        }))
        return transformedData;
    }

    private getDataForExcelAddingReport(data : any) {
        const detalizationArr = data.arr.map(row => ({
            realizationreport_id: data.realizationreport_id,
            date_from: data.dateFrom,
            date_to: data.dateTo,
            sa_name: row["Артикул поставщика"],
            doc_type_name: row["Тип документа"].toLowerCase(),
            quantity: row["Кол-во"],
            retail_amount: row["Вайлдберриз реализовал Товар (Пр)"],
            supplier_oper_name: row["Обоснование для оплаты"].toLowerCase(),
            retail_price_withdisc_rub: row["Цена розничная с учетом согласованной скидки"],
            delivery_amount: row["Количество доставок"],
            return_amount: row["Количество возврата"],
            delivery_rub: row["Услуги по доставке товара покупателю"],
            ppvz_for_pay: row["К перечислению Продавцу за реализованный Товар"],
            penalty: row["Общая сумма штрафов"],
            additional_payment: row["Доплаты"],
            storage_fee: row["Хранение"],
            deduction: row["Удержания"],
            acceptance: row["Платная приемка"]
        }))
    
        return detalizationArr
    }

    private getRetailAmountOfArticle = (detalization: FetchResponse[], article: string): number => {
        let sum = 0;
        detalization.forEach(item => {
            if (item.doc_type_name == "продажа" && item.sa_name === article) {
                sum +=item.ppvz_for_pay
            }
        });
        return sum
    }

    private getSaleCountOfArticle = (detalization: FetchResponse[], article: string) => {
        let count = 0;
        detalization.forEach(item => {
            if (item.doc_type_name == "продажа" && item.supplier_oper_name == "продажа" && item.sa_name == article) {
                count += 1
            }
        })
        return count
    }

    private getReturnCountOfArticle = (detalization: FetchResponse[], article: string) => {
        let count = 0;
        detalization.forEach(item => {
            if (item.sa_name == article && item.doc_type_name == "возврат") {
                count += 1
            }
        })
        return count
    }

    private getSaleSumOfArticle = (detalization: FetchResponse[], article: string) => {
        let sum = 0;
        detalization.forEach(item => {
            if (item.doc_type_name == "продажа" && item.sa_name == article) {
                sum +=item.ppvz_for_pay
            }
        });
        return sum
    }

    private getReturnSumOfArticle = (detalization: FetchResponse[], article: string) => {
        let sum = 0;
        detalization.forEach(item => {
            if (item.sa_name == article && item.doc_type_name == "возврат") {
                sum += item.ppvz_for_pay
            }
        })
        return sum
    }

    private getDeliveryOfArticle = (detalization: FetchResponse[], article: string) => {
        let sum = 0;
        detalization.forEach(item => {
            if (item.sa_name == article && item.supplier_oper_name == "логистика") {
                sum += item.delivery_rub;
            }
        });
        return sum
    }

    private getReport = async (arrayFromWB: FetchResponse[], dateFrom: string, dateTo: string, goods: Good[], user: User) => {
        const report = {
            realizationreport_id: arrayFromWB[0].realizationreport_id,
            date_from: dateFrom,
            date_to: dateTo,
            user: user._id,
            sale_sum_before_comission: 0,
            sale_count_before_comission: 0,
            return_sum_before_comission: 0,
            return_count_before_comission: 0,
            sale_sum_after_comission: 0,
            return_sum_after_comission: 0,
            comission_sum: 0,
            comission_rate: 0,
            scrap_payment_sum: 0,
            scrap_payment_count: 0,
            lost_goods_payment_sum: 0,
            lost_goods_payment_count: 0,
            substitute_compensation_sum: 0,
            substitute_compensation_count: 0,
            freight_reimbursement_sum: 0,
            freight_reimbursement_count: 0,
            sales_reversal_sum: 0,
            sales_reversal_count: 0,
            correct_sale_sum: 0,
            correct_sale_count: 0,
            reversal_returns_sum: 0,
            reversal_returns_count: 0,
            correct_return_sum: 0,
            correct_return_count: 0,
            adjustment_amount_sum: 0,
            adjustment_amount_count: 0,
            sale: 0,
            ppvz_for_pay: 0,
            delivery_to_customer_sum: 0,
            delivery_to_customer_count: 0,
            delivery_return_sum: 0,
            delivery_return_count: 0,
            delivery_sum: 0,
            delivery_count: 0,
            penalty: 0,
            additional_payment: 0,
            storage: 0,
            taking_payment: 0,
            other_deductions: 0,
            tax_sum: 0,
            final_profit: 0,
            composition: [],
        }
    
        arrayFromWB.forEach(async row => {
            if (row.doc_type_name == "продажа" && (row.supplier_oper_name == "продажа" || row.supplier_oper_name == "компенсация подмененного товара")) {
                report.sale_sum_before_comission += row.retail_price_withdisc_rub; // 001
                report.sale_count_before_comission += row.quantity; // 002
                report.sale_sum_after_comission += row.ppvz_for_pay; // 005
            }
            if (row.doc_type_name == "продажа" && (row.supplier_oper_name == "продажа" || row.supplier_oper_name == "сторно возвратов" || row.supplier_oper_name == "компенсация подмененного товара")) {
                report.sale += row.retail_amount; // 027
            }
            if (row.doc_type_name == "возврат" && row.supplier_oper_name == "возврат") {
                report.return_sum_before_comission += row.retail_price_withdisc_rub; // 003
                report.return_count_before_comission += row.quantity; // 004
                report.return_sum_after_comission += row.ppvz_for_pay; // 006
                report.sale -= row.retail_amount
            }
            if (row.supplier_oper_name == "оплата брака") {
                report.scrap_payment_sum += row.ppvz_for_pay; // 009
                report.scrap_payment_count += row.quantity; // 010
            }
            if (row.supplier_oper_name == "оплата потерянного товара") {
                report.lost_goods_payment_sum += row.ppvz_for_pay; // 011
                report.lost_goods_payment_count += row.quantity; // 012
            }
            if (row.supplier_oper_name == "компенсация подмененного товара") {
                report.substitute_compensation_sum += row.retail_amount; // 013
                report.substitute_compensation_count += row.quantity; // 014
            }
            if (row.supplier_oper_name == "возмещение издержек по перевозке") {
                report.freight_reimbursement_sum += row.ppvz_for_pay; // 015
                report.freight_reimbursement_count += row.quantity; // 016
            }
            if (row.supplier_oper_name == "сторно продаж") {
                report.sales_reversal_sum += row.ppvz_for_pay; // 017
                report.sales_reversal_count += row.quantity; // 018
            }
            if (row.supplier_oper_name == "корректная продажа") {
                report.correct_sale_sum += row.ppvz_for_pay; // 019
                report.correct_sale_count += row.quantity; // 020
            }
            if (row.supplier_oper_name == "сторно возвратов") {
                report.reversal_returns_sum += row.ppvz_for_pay; // 021
                report.reversal_returns_count += row.quantity; // 022
            }
            if (row.supplier_oper_name == "корректный возврат") {
                report.correct_return_sum += row.ppvz_for_pay; // 023
                report.correct_return_count += row.quantity; // 024
            }
            if (row.delivery_amount > 0) {
                report.delivery_to_customer_sum += row.delivery_rub; // 029
                report.delivery_to_customer_count += row.delivery_amount; // 030
            }
            if (row.return_amount > 0) {
                report.delivery_return_sum += row.delivery_rub; // 031
                report.delivery_return_count += row.return_amount; // 032
            }
            report.delivery_sum += row.delivery_rub; // 033
            if (row.supplier_oper_name == "штраф") {
                report.penalty += row.penalty; // 035
            }
            if (row.supplier_oper_name == "доплаты") {
                report.additional_payment += row.additional_payment; // 036
            }
            if (!report.composition.find(i => i.article === row.sa_name) && row.supplier_oper_name === "продажа") {
                const good = goods.find(i => i.article === row.sa_name);
    
                if (!good) {
                    this.goodService.createGood({
                        article: row.sa_name.toLowerCase(),
                        user: user._id,
                        cost_price: 0
                    });
                }
    
                report.composition.push({
                    article: good ? good.article : row.sa_name,
                    cost_price: good ? good.cost_price : 0,
                    retail_amount: this.getRetailAmountOfArticle(arrayFromWB, row.sa_name),
                    sale_count: this.getSaleCountOfArticle(arrayFromWB, row.sa_name),
                    return_count: this.getReturnCountOfArticle(arrayFromWB, row.sa_name),
                    sale_sum: this.getSaleSumOfArticle(arrayFromWB, row.sa_name),
                    return_sum: this.getReturnSumOfArticle(arrayFromWB, row.sa_name),
                    delivery: this.getDeliveryOfArticle(arrayFromWB, row.sa_name),
                })
            }
        });
    
        report.comission_sum = (report.sale_sum_before_comission - report.return_sum_before_comission) - (report.sale_sum_after_comission - report.return_sum_after_comission); // 007
        report.adjustment_amount_sum = report.correct_sale_sum - report.sales_reversal_sum + report.reversal_returns_sum - report.correct_return_sum; // 025
        report.comission_rate = (report.comission_sum + report.adjustment_amount_sum) / report.sale_sum_before_comission; // 008
        report.adjustment_amount_count = report.sales_reversal_count + report.correct_sale_count + report.reversal_returns_count + report.correct_return_count; // 026
        report.ppvz_for_pay = report.sale_sum_after_comission - report.return_sum_after_comission + report.adjustment_amount_sum; // 028
        report.delivery_count = report.delivery_to_customer_count + report.delivery_return_count; // 034
        report.tax_sum = report.sale * 0.07; // 044
        report.other_deductions = arrayFromWB.reduce((sum, el) => sum +el.deduction, 0);
        report.storage = arrayFromWB.reduce((sum, el) => sum + el.storage_fee, 0);
        report.taking_payment = arrayFromWB.reduce((sum, el) => sum + el.acceptance, 0);
    
        return report
    }
}
