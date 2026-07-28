import { GradeLevelModel } from './grade-level-model';

describe('GradeLevelModel', () => {
  const model = new GradeLevelModel('gl1', 'Grade 10', 10, true);

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct name', () => expect(model.name).toBe('Grade 10'));
  it('should have correct order', () => expect(model.order).toBe(10));
  it('toJson should return correct shape', () => expect(model.toJson().active).toBeTrue());
  it('fromJson should create instance', () => {
    const m = GradeLevelModel.fromJson({ id: 'gl2', name: 'Grade 11', order: 11, active: false });
    expect(m).toBeInstanceOf(GradeLevelModel);
    expect(m.active).toBeFalse();
  });
});
