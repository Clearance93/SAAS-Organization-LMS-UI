export interface CreateLearnerDto {
    firstName: string;
    lastName: string;
    learnerEmail: string;
    learnerProfilePicture: string;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
}
