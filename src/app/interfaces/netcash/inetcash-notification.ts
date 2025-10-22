export interface INetcashNotification {
    RequestTrace?: string;
    Extra1?: string;
    Extra2?: string;
    Extra3?: string;
    Amount: string;
    Reference: string;
    TransactionAccepted: boolean;
    Reason?: string; 
}
