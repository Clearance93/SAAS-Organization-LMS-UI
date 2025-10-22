import { INetcashPaymentResponse } from "../../../../interfaces/netcash/inetcash-payment-response";

export class NetcashPaymentResponse implements INetcashPaymentResponse {
     RequestId?: string;
    Reference?: string;
    TransactionAccepted: boolean;
    Reason?: string;
    Amount?: Number;
    Status?: string;

    constructor(init?: Partial<NetcashPaymentResponse>) {
        this.RequestId = init?.RequestId;
        this.Reference = init?.Reference;
        this.TransactionAccepted = init?.TransactionAccepted || false;
        this.Reason = init?.Reason;
        this.Amount = init?.Amount;
        this.Status = init?.Status
    }
}
