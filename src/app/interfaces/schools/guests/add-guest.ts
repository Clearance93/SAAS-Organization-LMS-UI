export interface AddGuest {
    id?: string;
    firstName: string;
    lastName: string;
    guestEmail: string;
    guestProfilePicture: string;
    isDeleted: string;
    isActive: string;
    CreateedAt: Date;
    UpdatedAt: Date;
    organizationSetupId: string;
}
