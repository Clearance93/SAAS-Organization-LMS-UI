import { IOrganization } from "./organization.interface";
import { OrganizationType, ServiceType, ServiceDuration, OrganizationStatus } from "./organization.enums";

export class Organization implements IOrganization {
        id?: string;
        organizationName: string;
        organizationType: OrganizationType;
        organizationAddress: string;
        organizationContactNumber: string;
        website?: string;
        serviceDuration: ServiceDuration;
        serviceType: ServiceType[];
        status?: OrganizationStatus;
        subscriptionPlan?: string;
        memberCount?: number;
        adminEmail?: string
        createdAt?: Date;
        updatedAt?: Date;
        isActive?: boolean;

        constructor(data?: Partial<IOrganization>) {
        this.id = data?.id
        this.organizationName = data?.organizationName || '';
        this.organizationType = data?.organizationType || OrganizationType.CORPORATE;
        this.organizationAddress = data?.organizationAddress || '';
        this.organizationContactNumber = data?.organizationContactNumber || '';
        this.website = data?.website;
        this.serviceDuration = data?.serviceDuration || ServiceDuration.ONE_MONTH;
        this.serviceType = data?.serviceType || [];
        this.status = data?.status || OrganizationStatus.PENDING;
        this.subscriptionPlan = data?.subscriptionPlan;
        this.memberCount = data?.memberCount;
        this.adminEmail = data?.adminEmail;
        this.createdAt = data?.createdAt;
        this.updatedAt = data?.updatedAt;
        this.isActive = data?.isActive ?? true;
    }

    isCorporate(): boolean {
        return this.organizationType === OrganizationType.CORPORATE;
    }

    isChurch(): boolean {
        return this.organizationType === OrganizationType.CHURCH;
    }

    isSchool(): boolean {
        return this.organizationType === OrganizationType.SCHOOL;
    }

    isNGO(): boolean {
        return this.organizationType === OrganizationType.NGO;
    }

    getFormattedDuration(): string {
        if (this.serviceDuration === 1) return '1 Month';
        if (this.serviceDuration === 3) return '3 Month';
        if (this.serviceDuration === 6) return '6 Month';
        if (this.serviceDuration === 12) return '1 Year';
        if (this.serviceDuration === 24) return '2 Years';
        if (this.serviceDuration === 36) return '3 Years';
        if (this.serviceDuration === 48) return '4 Years';
        if (this.serviceDuration === 60) return '5 Years';
        
        return `${this.serviceDuration} Months`;
    }
}