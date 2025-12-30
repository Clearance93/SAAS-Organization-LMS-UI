import { SchoolAdminSettingsDto } from "../../../../interfaces/settings/school-admin-settings-dto";

export class SchoolAdminGeneralSettings implements SchoolAdminSettingsDto {
    organizationId: string;
    schoolName: string;
    schoolType: string;
    schoolMotto?: string;
    timeZone: string;
    contactEmail: string;
    contactPhoneNumber?: string ;
    createdAt?: Date;
    updateAt?: Date;
    locale: string;

    constructor(data: SchoolAdminSettingsDto) {
        this.organizationId = data.organizationId;
        this.schoolName = data.schoolName;
        this.schoolType = data.schoolType;
        this.schoolMotto = data.schoolMotto;
        this.timeZone = data.timeZone;
        this.locale = data.locale;
        this.contactEmail = data.contactEmail;
        this.contactPhoneNumber = data.contactPhoneNumber;
        this.createdAt = data.createdAt;
        this.updateAt = data.updateAt;
    }

    static fromJson(json: any): SchoolAdminGeneralSettings {
        return new SchoolAdminGeneralSettings({
            organizationId: json.organizationId || json.organizationId,
            schoolName: json.schoolName || json.schoolName,
            schoolType: json.schoolType || json.schoolType,
            schoolMotto: json.schoolMotto || json.schoolMotto,
            timeZone: json.timeZone || json.timeZone,
            locale: json.locale || json.locale,
            contactEmail: json.contactEmail || json.contactEmail,
            contactPhoneNumber: json.contactPhoneNumber || json.contactPhoneNumber,
            createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
            updateAt: json.updateAt ? new Date(json.updateAt) : undefined
        })
    }

    toApiRequest(): any {
        return {
            organizationId: this.organizationId,
            schoolName: this.schoolName,
            schoolType: this.schoolType,
            schoolMotto: this.schoolMotto || '',
            timeZone: this.timeZone,
            locale: this.locale,
            contactEmail: this.contactEmail,
            contactPhoneNumber: this.contactPhoneNumber || ''
        }
    }
}
