import { UserRole } from '../enums/role.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
