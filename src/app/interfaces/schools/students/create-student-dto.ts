export interface CreateStudentDto {
    firstName: string;
    lastName: string;
    studentEmail: string;
    registrationLinkId: string;
    studentProfilePicture: string;
    password: string;
    dateOfBirth: Date;
    gender: string;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
}
