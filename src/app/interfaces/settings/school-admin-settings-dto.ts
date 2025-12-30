export interface SchoolAdminSettingsDto {
    organizationId: string;
    schoolName: string;
    schoolMotto?: string;
    schoolType: string;
    timeZone: string;
    locale: string;
    contactEmail: string;
    contactPhoneNumber?: string;
    createdAt?: Date;
    updateAt?: Date;
}
