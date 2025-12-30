import { AcademicYear } from "./academic-year";
import { NotificationPreference } from "./notification-preference";
import { SchoolProfile } from "./school-profile";

export interface GeneralSettings {
    profile: SchoolProfile;
    academicYear: AcademicYear;
    notification: NotificationPreference
}
