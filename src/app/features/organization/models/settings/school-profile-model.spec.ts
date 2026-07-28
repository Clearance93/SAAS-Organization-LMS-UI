import { SchoolProfileModel } from './school-profile-model';

describe('SchoolProfileModel', () => {
  const model = new SchoolProfileModel('sp1', 'Test School', 'Secondary', 'Africa/Johannesburg', 'en-ZA');

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct name', () => expect(model.name).toBe('Test School'));
  it('toJson should return correct shape', () => expect(model.toJson().name).toBe('Test School'));
  it('fromJson should create instance', () => {
    const m = SchoolProfileModel.fromJson({ id: 'sp2', name: 'School B', type: 'Primary', timeZone: 'UTC', locale: 'en' });
    expect(m).toBeInstanceOf(SchoolProfileModel);
  });
});
