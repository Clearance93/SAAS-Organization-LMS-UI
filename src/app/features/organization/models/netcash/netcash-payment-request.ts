import { INetcashPaymentRequest } from "../../../../interfaces/netcash/inetcash-payment-request";

export class NetcashPaymentRequest implements INetcashPaymentRequest {
    m1: string; 
    m2: string; 
    p2: string; 
    p3: string; 
    p4: string; 

    m4?: string; 
    m5?: string; 
    m6?: string; 
    m7?: string; 
    m8?: string; 
    m9?: string; 
    m10?: string; 

    Budget?: 'Y' | 'N';
    ExtraFields?: string

    constructor(init?: Partial<NetcashPaymentRequest>) {
        this.m1 = init?.m1 || '';
        this.m2 = init?.m2 || '';
        this.p2 = init?.p2 || '';
        this.p3 = init?.p3 || '';
        this.p4 = init?.p4 || '';

        this.m4 = init?.m4 || '';
        this.m5 = init?.m5 || '';
        this.m6 = init?.m6 || '';
        this.m7 = init?.m7 || '';
        this.m8 = init?.m8 || '';
        this.m9 = init?.m9 || '';
        this.m10 = init?.m10 || '';

        this.Budget = init?.Budget || 'N';
        this.ExtraFields = init?.ExtraFields
    }

    static convertToCents(amountInRands: number): string {
        return Math.round(amountInRands * 100).toString();
    }

    toFormData(): Record<string, string> {
        const formData: Record<string, string> = {
            m1: this.m1,
            m2: this.m2,
            p2: this.p2,
            p3: this.p3,
            p4: this.p4
        };

        if (this.m4) formData['m4'] = this.m4;
        if (this.m5) formData['m5'] = this.m5;
        if (this.m6) formData['m6'] = this.m6;
        if (this.m7) formData['m7'] = this.m7;
        if (this.m8) formData['m8'] = this.m8;
        if (this.m9) formData['m9'] = this.m9;
        if (this.m10) formData['m10'] = this.m10
        if (this.Budget) formData['Budget'] = this.Budget;
        if (this.ExtraFields) formData['ExtraField'] = this.ExtraFields;

        return formData;
    }
}
