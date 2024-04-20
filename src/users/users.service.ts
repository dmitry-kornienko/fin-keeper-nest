import { Model } from "mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const newUser = new this.userModel(createUserDto);
        return newUser.save();
    }

    async getAllUsers(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async getUserByEmail(email: string) {
        const user = await this.userModel.findOne({ email });
        return user;
    }

    async getUserById(id: string) {
        const user = await this.userModel.findOne({ _id: id });
        return user;
    }

    async activate(activationLink: string) {
        const user = await this.userModel.findOne({ activationLink });

        if (!user) {
            throw new HttpException(
                "Некорректная ссылка",
                HttpStatus.BAD_REQUEST
            );
        }

        user.isActivated = true;
        await user.save();
    }
}
