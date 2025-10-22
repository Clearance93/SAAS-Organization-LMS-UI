import { IOrganizationRequest } from "./iorganization-request";

export class OrganizationRequest implements IOrganizationRequest{
    organizationName: string;
    typeOfOrganization: string;
    organizationAddress: string;
    organizationContactNumber: string;
    website: string;
    adminEmail: string;
    serviceDuration: string;
    typeOfService: string[];

    constructor(data?: Partial<IOrganizationRequest>) {
        this.organizationAddress = data?.organizationAddress || '';
        this.organizationContactNumber = data?.organizationContactNumber || ''
        this.organizationName = data?.organizationName || '';
        this.typeOfOrganization = data?.typeOfOrganization || '';
        this.website = data?.website || '';
        this.adminEmail = data?.adminEmail || '';
        this.serviceDuration = data?.serviceDuration || '';
        this.typeOfService = data?.typeOfService || [];
    }

    isValid(): boolean {
        return (
            this.organizationName.trim() !== '' &&
            this.organizationContactNumber.trim() !== '' &&
            this.typeOfOrganization.trim() !== '' &&
            this.adminEmail.trim() !== '' &&
            this.organizationAddress.trim() !== '' &&
            this.website.trim() !== '' &&
            this.serviceDuration.trim() !== '' &&
            this.typeOfService.length > 0 
        );
    }

    toJSON(): IOrganizationRequest {
        return {
            organizationName: this.organizationName,
            typeOfOrganization: this.typeOfOrganization,
            organizationContactNumber: this.organizationContactNumber,
            organizationAddress: this.organizationAddress,
            website: this.website,
            adminEmail: this.adminEmail,
            serviceDuration: this.serviceDuration,
            typeOfService: this.typeOfService
        }
    }
}