import { UserRole } from '../enums/role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    role?: UserRole;
}
