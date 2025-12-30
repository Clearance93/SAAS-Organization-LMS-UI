export interface AdminProfileData {
    organizationSetupId: string;
    organizationName: string;
    totalAdmins: number;
    totalTeachers: number;
    totalStudents: number;
    totalStuff: number;
    totalGuests: number;
    adminId: string;
    firstName: string;
    lastName: string;
    adminBusinessEmail: string | null;
    adminProfilePicture: string | null;
    isSuperAdmin: boolean;
    typeOfService: string;
}
