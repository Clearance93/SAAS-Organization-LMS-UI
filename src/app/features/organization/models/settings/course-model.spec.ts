import { CourseModel } from './course-model';

describe('CourseModel', () => {
  const model = new CourseModel('c1', 'Math', ['g1'], 'Active');

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct id', () => expect(model.id).toBe('c1'));
  it('isActive should return true for Active status', () => expect(model.isActive).toBeTrue());
  it('toJson should return correct shape', () => expect(model.toJson().id).toBe('c1'));
  it('fromJson should create instance', () => {
    const m = CourseModel.fromJson({ id: 'c2', title: 'Science', gradeids: [], status: 'Inactive' });
    expect(m).toBeInstanceOf(CourseModel);
    expect(m.isActive).toBeFalse();
  });
});
