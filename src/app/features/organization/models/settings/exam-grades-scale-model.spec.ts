import { ExamGradesScaleModel } from './exam-grades-scale-model';

describe('ExamGradesScaleModel', () => {
  const model = new ExamGradesScaleModel('eg1', 'org1', 50, 75, 90, 60, 30);

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct passMark', () => expect(model.passMark).toBe(50));
  it('toJson should return correct shape', () => expect(model.toJson().passMark).toBe(50));
  it('fromJson should create instance', () => {
    const m = ExamGradesScaleModel.fromJson({ examGradeScaleId: 'eg2', organizationId: 'org2', passMark: 40, distinctionMark: 80, excellentMark: 95, averageMark: 55, poorMark: 20 });
    expect(m).toBeInstanceOf(ExamGradesScaleModel);
  });
});
