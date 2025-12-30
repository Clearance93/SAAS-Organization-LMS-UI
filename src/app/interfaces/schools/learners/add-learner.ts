export interface AddLearner {
    id?: string;
    firstName: string;
    lastName: string;
    learnerEmail: string;
    learnerProfilePicture: string;
    isDeleted: string;
    isActive: string;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
}
