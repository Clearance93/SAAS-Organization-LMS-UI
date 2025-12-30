import { types } from "util";

export interface NotificationPreference {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    types: string[];
}
