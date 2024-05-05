import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Report {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
    user: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    realizationreport_id: number;

    @Prop()
    date_from: string;
    
    @Prop()
    date_to: string;

    @Prop()
    sale_sum_before_comission: number;

    @Prop()
    sale_count_before_comission: number;

    @Prop()
    return_sum_before_comission: number;
    
    @Prop()
    return_count_before_comission: number;
    
    @Prop()
    sale_sum_after_comission: number;
    
    @Prop()
    return_sum_after_comission: number;
    
    @Prop()
    comission_sum: number;
    
    @Prop()
    comission_rate: number;
    
    @Prop()
    scrap_payment_sum: number;
    
    @Prop()
    scrap_payment_count: number;
    
    @Prop()
    lost_goods_payment_sum: number;
    
    @Prop()
    lost_goods_payment_count: number;
    
    @Prop()
    substitute_compensation_sum: number;
    
    @Prop()
    substitute_compensation_count: number;
    
    @Prop()
    freight_reimbursement_sum: number;
    
    @Prop()
    freight_reimbursement_count: number;
    
    @Prop()
    sales_reversal_sum: number;
    
    @Prop()
    sales_reversal_count: number;
    
    @Prop()
    correct_sale_sum: number;
    
    @Prop()
    correct_sale_count: number;
    
    @Prop()
    reversal_returns_sum: number;
    
    @Prop()
    reversal_returns_count: number;
    
    @Prop()
    correct_return_sum: number;
    
    @Prop()
    correct_return_count: number;
    
    @Prop()
    adjustment_amount_sum: number;
    
    @Prop()
    adjustment_amount_count: number;
    
    @Prop()
    sale: number;
    
    @Prop()
    ppvz_for_pay: number;
    
    @Prop()
    delivery_to_customer_sum: number;
    
    @Prop()
    delivery_to_customer_count: number;
    
    @Prop()
    delivery_return_sum: number;
    
    @Prop()
    delivery_return_count: number;
    
    @Prop()
    delivery_sum: number;
    
    @Prop()
    delivery_count: number;
    
    @Prop()
    penalty: number;
    
    @Prop()
    additional_payment: number;
    
    @Prop()
    storage: number;
    
    @Prop()
    taking_payment: number;
    
    @Prop()
    other_deductions: number;
    
    @Prop()
    tax_sum: number;
    
    @Prop()
    composition: [{
        article: string,
        cost_price: number,
        retail_amount: number,
        sale_count: number,
        return_count: number,
        sale_sum: number,
        return_sum: number,
        delivery: number,
    }];
}

export const ReportSchema = SchemaFactory.createForClass(Report);