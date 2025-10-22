import { IRegisterResponse } from "./iregister-response";

export class RegisterResponse implements IRegisterResponse {
    userId?: string;
    message?: string;
    success?: boolean;

    constructor(data?: Partial<IRegisterResponse>) {
        this.userId = data?.userId;
        this.message = data?.message;
        this.success = data?.success ?? true;
    }

    isSuccessful(): boolean {
        return this.success === true;
    }
}
