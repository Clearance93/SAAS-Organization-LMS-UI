import { UserRole } from "./UserRole";

export interface IRegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    ProfileImage?: string;
    password: string;
    role: UserRole
}
