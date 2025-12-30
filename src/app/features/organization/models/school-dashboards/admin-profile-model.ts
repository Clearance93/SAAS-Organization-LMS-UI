export class AdminProfileModel {
    organizationSetupId : string;
    firstName: string;
    lastName: string;
    adminBusinessEmail: string;
    adminProfilePicture: string;
    isActive: boolean;
    isSuperAdmin: boolean
    AdminId: string;
    organizationName: string;
    typeOfService: string;

    constructor(data: Partial<AdminProfileModel> = {}) {
        this.organizationSetupId = data.organizationSetupId || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.adminBusinessEmail = data.adminBusinessEmail || '';
        this.adminProfilePicture = data.adminProfilePicture || '';
        this.isActive = data.isActive || true;
        this.isSuperAdmin = data.isSuperAdmin || false
        this.AdminId = data.AdminId || '';
        this.organizationName = data.organizationName || '';
        this.typeOfService = data.typeOfService || '';
    }
}
