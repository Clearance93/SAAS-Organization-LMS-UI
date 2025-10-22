//The command below are the notes to be adintfied by netcash
export interface INetcashPaymentRequest {
    m1: string; // Service Key we get this from config
    m2: string; // Software vendor Key
    p2: string; // Unique order reference
    p3: string; // Description of goods/services
    p4: string; // Amount in cents 

    m4?: string; // Return URL after payment
    m5?: string; // Cancel URL
    m6?: string; // Error URL
    m7?: string; // Notify URL for IPN
    m8?: string; // Customer Name
    m9?: string; // Customer email
    m10?: string; // Customer phone

    Budget?: 'Y' | 'N';
    ExtraFields?: string
}
