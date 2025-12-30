import { AcademicSettings } from "./academic-settings";
import { BillingSettings } from "./billing-settings";
import { CommunicationSettings } from "./communication-settings";
import { CourseSettings } from "./course-settings";
import { ExamSettings } from "./exam-settings";
import { GeneralSettings } from "./general-settings";
import { IntergrationSettings } from "./intergration-settings";
import { LibrarySettings } from "./library-settings";
import { ServiceSettings } from "./service-settings";
import { StorageSettings } from "./storage-settings";
import { UserSettings } from "./user-settings";

export interface SchoolSettings {
    general: GeneralSettings;
    academic: AcademicSettings;
    courses: CourseSettings;
    exams: ExamSettings;
    library: LibrarySettings;
    services: ServiceSettings;
    users: UserSettings;
    communication: CommunicationSettings;
    integrations: IntergrationSettings;
    storage: StorageSettings;
    billing?: BillingSettings
}
