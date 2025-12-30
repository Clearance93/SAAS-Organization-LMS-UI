export interface CreateTeacherDto {
    firstName: string;
    lastName: string;
    teacherEmail: string;
    teacherProfilePicture: string
    isDeleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
    registrationLinkId?: string | null;
}
