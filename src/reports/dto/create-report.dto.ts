import { Schema } from "mongoose";

export class CreateReportDto {
    readonly user: Schema.Types.ObjectId;
    readonly realizationreport_id: number;
    readonly date_from: string;
    readonly date_to: string;
}