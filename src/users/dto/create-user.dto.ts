export class CreateUserDto {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly tokenWB: string;
    readonly activationLink: string;
}