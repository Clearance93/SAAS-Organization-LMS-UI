import { SchoolAdminGeneralSettings } from './school-admin-general-settings';

describe('SchoolAdminGeneralSettings', () => {
  const data = {
    organizationId: 'org1', schoolName: 'Test School', schoolType: 'Secondary',
    timeZone: 'Africa/Johannesburg', locale: 'en-ZA', contactEmail: 'admin@school.com'
  };
  const model = new SchoolAdminGeneralSettings(data as any);

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct schoolName', () => expect(model.schoolName).toBe('Test School'));
  it('toApiRequest should return correct shape', () => expect(model.toApiRequest().contactEmail).toBe('admin@school.com'));
  it('fromJson should create instance', () => {
    const m = SchoolAdminGeneralSettings.fromJson({ ...data });
    expect(m).toBeInstanceOf(SchoolAdminGeneralSettings);
  });
});
