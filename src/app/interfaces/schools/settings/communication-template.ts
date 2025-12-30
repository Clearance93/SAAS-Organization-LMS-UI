export interface CommunicationTemplate {
    id: string;
    name: string;
    type: 'EMAIL' | 'SMS';
    subject?: string;
    content: string;
}
