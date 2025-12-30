import { Observable } from "rxjs";
import { SchoolAdminGeneralSettings } from "../../features/organization/models/settings/school-admin-general-settings";
import { SchoolAdminSettingsDto } from "./school-admin-settings-dto";

export interface IAdminSettingsService {
    getSchoolSettings(organizationId: string): Observable<SchoolAdminGeneralSettings>;
    updateSchoolSettings(settings: SchoolAdminSettingsDto): Observable<SchoolAdminGeneralSettings>;
    createSchoolSettings(settings: SchoolAdminSettingsDto): Observable<SchoolAdminGeneralSettings>;

    schoolSettings$: Observable<SchoolAdminGeneralSettings | null>
}
