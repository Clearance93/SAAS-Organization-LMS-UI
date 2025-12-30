export interface CreateGuestDto {
    firstName: string;
    lastName: string;
    guestEmail: string;
    guestProfilePicture: string;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
}
