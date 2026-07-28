import { ExamTypeModel } from './exam-type-model';

describe('ExamTypeModel', () => {
  const model = new ExamTypeModel('et1', 'Final Exam');

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct name', () => expect(model.name).toBe('Final Exam'));
  it('toJson should return correct shape', () => expect(model.toJson().name).toBe('Final Exam'));
  it('fromJson should create instance', () => {
    const m = ExamTypeModel.fromJson({ id: 'et2', name: 'Quiz', gradingScaleId: null, isAutoMarked: true });
    expect(m).toBeInstanceOf(ExamTypeModel);
  });
});
