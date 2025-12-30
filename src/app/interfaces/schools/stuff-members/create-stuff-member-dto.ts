export interface CreateStuffMemberDto {
    firstName: string;
    lastName: string;
    stuffMemberEmail: string;
    stuffMemberProfilePicture: string;
    stuffMemberPosition: string;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
    registrationLinkId?: string | null;
}
