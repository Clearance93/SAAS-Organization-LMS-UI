import { OrganizationType, ServiceType, ServiceDuration, OrganizationStatus } from "./organization.enums";

export interface IOrganization {
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
    adminEmail?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
}

export type CreateOrganizationDto = Omit<IOrganization, 'id' |
                                                        'createdAt' | 
                                                        'memberCount'>;

export type UpdateOrganizationDto = Partial<CreateOrganizationDto> & { id: string }