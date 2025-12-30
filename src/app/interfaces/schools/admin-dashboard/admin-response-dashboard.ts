export interface AdminResponseDashboard {
    organizationSetupId: string;
    organizationName: string;
    totalAdmins: number;
    totalTeachers: number;
    totalStudents: number;
    totalStuff: number;
    totalGuests: number;
    typeOfService: string;
    adminId: string;
    firstName: string;
    lastName: string;
    adminBusinessEmail: string | null;
    adminProfilePicture: string | null;
    isSuperAdmin: boolean
}
