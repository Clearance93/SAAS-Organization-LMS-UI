import { CommunicationTemplate } from "./communication-template";

export interface CommunicationSettings {
    templates: CommunicationTemplate[];
    smtpConfig?: any;
}
