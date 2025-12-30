import { SchoolProfile } from "../../../../interfaces/schools/settings/school-profile";

export class SchoolProfileModel implements SchoolProfile {
    constructor(
        public id: string,
        public name: string,
        public type: 'Primary' | 'Secondary' | 'Combined' | 'Organization',
        public timeZone: string,
        public locale: string,
        public logoUrl?: string | null,
        public motto?: string,
        public themeColor?: string,
        public contactEmail?: string,
        public contactNumber?: string
    ) {}

    static fromJson(json: any): SchoolProfileModel {
        return new SchoolProfileModel(
            json.id,
            json.name,
            json.type,
            json.timeZone,
            json.locale,
            json.logoUrl,
            json.motto,
            json.themeColor,
            json.contactEmail,
            json.contactNumber
        );
    }

    toJson(): any {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            timeZone: this.timeZone,
            locale: this.locale,
            logoUel: this.logoUrl,
            motto: this.motto,
            themeColor: this.themeColor,
            contactEmail: this.contactEmail,
            contactNumber: this.contactNumber
        };
    }
}
