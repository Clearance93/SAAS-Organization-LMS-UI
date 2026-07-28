import { SchoolSubjectModel } from './school-subject-model';

describe('SchoolSubjectModel', () => {
  const model = new SchoolSubjectModel('sub1', 'cs1', 'Mathematics', 'Grade 10');

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct subjectName', () => expect(model.subjectName).toBe('Mathematics'));
  it('toJson should return correct shape', () => expect(model.toJson().subjectName).toBe('Mathematics'));
  it('fromJson should create instance', () => {
    const m = SchoolSubjectModel.fromJson({ subjectId: 'sub2', courseStreamId: 'cs2', subjectName: 'Science', gradeLevel: 'Grade 11' });
    expect(m).toBeInstanceOf(SchoolSubjectModel);
  });
});
