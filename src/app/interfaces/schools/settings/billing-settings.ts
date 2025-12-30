import { BillingPlan } from "./billing-plan";

export interface BillingSettings {
    currentPlan: BillingPlan;
    availaablePlans: BillingPlan[];
    invoices: any[];
}
