export interface SchoolAdminSettingsResponse {
    organizationId: string;
    schoolName: string;
    schoolType: string;
    schoolMotto?: string;
    timeZone: string;
    locale: string;
    contactEmail: string;
    createdAt?: Date;
    updatedAt?: Date;
}
