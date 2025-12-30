import { SchoolSettings } from "../../../../interfaces/schools/settings/school-settings";
import { StorageSettings } from "../../../../interfaces/schools/settings/storage-settings";

export class SchoolSettingsModel implements SchoolSettings {
  constructor(
    public general: any,
    public academic: any,
    public courses: any,
    public exams: any,
    public library: any,
    public services: any,
    public users: any,
    public communication: any,
    public integrations: any,
    public storage: StorageSettings,
    public billing?: any
  ) {}

  static fromJson(json: any): SchoolSettingsModel {
    return new SchoolSettingsModel(
      json.general,
      json.academic,
      json.courses,
      json.exams,
      json.library,
      json.services,
      json.users,
      json.communication,
      json.integrations,
      json.storage,
      json.billing
    );
  }

  toJson(): any {
    return {
      general: this.general,
      academic: this.academic,
      courses: this.courses,
      exams: this.exams,
      library: this.library,
      services: this.services,
      users: this.users,
      communication: this.communication,
      integrations: this.integrations,
      storage: this.storage,
      billing: this.billing
    };
  }
}