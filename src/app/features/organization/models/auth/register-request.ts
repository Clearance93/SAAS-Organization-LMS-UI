import { IRegisterRequest } from "./iregister-request";
import { UserRole } from "./UserRole";

export class RegisterRequest implements IRegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    ProfileImage?: string;
    password: string;
    role: UserRole;

    constructor(data?: Partial<IRegisterRequest>) {
        this.firstName = data?.firstName || '';
        this.lastName = data?.lastName || '';
        this.email = data?.email || '';
        this.image = data?.image || '';
        this.ProfileImage = (data as any)?.ProfileImage || '';
        this.password = data?.password || '';
        this.role = data?.role || UserRole.ADMIN;
    }

    isValid(): boolean {
        return (
            this.firstName.trim() !== '' &&
            this.lastName.trim() !== '' &&
            this.email.trim() !== '' &&
            this.password.trim() !== '' &&
            this.role.trim() !== '' &&
            this.role !== null
        );
    }

    getFullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    toJSON(): IRegisterRequest {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            image: this.image,
            ProfileImage: this.ProfileImage,
            password: this.password,
            role: this.role
        };
    }
}