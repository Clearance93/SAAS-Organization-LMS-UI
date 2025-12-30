export interface CreateStudentDto {
    firstName: string;
    lastName: string;
    studentEmail: string;
    studentProfilePicture: string;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updateAt: Date;
    dateOfBirth: Date;
    gender: string;
    organizationSetupId: string;
    registrationLinkId?: string | null;
}
