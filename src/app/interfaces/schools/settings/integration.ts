export interface Integration {
    id: string;
    name: string;
    type: 'PAYMENT' | 'STORAGE' | 'EMAIL' | 'LMS';
    enabled: boolean;
    config: Record<string, any>;
}
