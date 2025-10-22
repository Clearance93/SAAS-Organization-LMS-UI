export interface INetcashPaymentResponse {
    RequestId?: string;
    Reference?: string;
    TransactionAccepted: boolean;
    Reason?: string;
    Amount?: Number;
    Status?: string;
}
