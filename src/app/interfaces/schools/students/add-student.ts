export interface AddStudent {
    id?: string;
    firstName: string;
    lastName: string;
    studentEmail: string;
    studentProfilePicture: string;
    isDeleted: string;
    isActive: string;
    createdAt: Date
    updatedAt: Date;
    organizationSetupId: string;
}
