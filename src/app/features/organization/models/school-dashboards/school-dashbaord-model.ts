export class SchoolDashbaordModel {
    organizationSetupId: string;
    organizationName: string;
    totalAdmins: number;
    totalTeachers: number;
    totalStudents: number;
    totalStaff: number;
    totalGuests: number;
    typeOfService: string;
    firstName: string;
    lastName: string;
    adminBusinessEmail: string | null;
    adminProfilePicture: string | null;
    isSuperAdmin: boolean;
    adminId: string;

    constructor(data: Partial<SchoolDashbaordModel> = {}) {
        this.organizationSetupId = data.organizationSetupId || '';
        this.organizationName = data.organizationName || '';
        this.totalAdmins = data.totalAdmins || 0;
        this.totalTeachers = data.totalTeachers || 0;
        this.totalStudents = data.totalStudents || 0;
        this.totalStaff = data.totalStaff || 0;
        this.totalGuests = data.totalGuests || 0
        this.adminBusinessEmail = data.adminBusinessEmail || '';
        this.adminProfilePicture = data.adminProfilePicture || '';
        this.typeOfService = data.typeOfService || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.isSuperAdmin = data.isSuperAdmin || false
        this.adminId = data.adminId || '';
    } 
}
