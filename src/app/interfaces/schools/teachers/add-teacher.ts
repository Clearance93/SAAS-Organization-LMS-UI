export interface AddTeacher {
    id?: string;
    firstName: string;
    lastName: string;
    teacherEmail: string;
    teacherProfilePicture: string;
    isDeleted: string;
    isActive: string;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
}
