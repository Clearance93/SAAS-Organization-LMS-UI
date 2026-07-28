import { CourseStreamModel } from './course-stream-model';

describe('CourseStreamModel', () => {
  const model = new CourseStreamModel('cs1', 'org1', 'Stream A', 'Desc');

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct courseStreamId', () => expect(model.courseStreamId).toBe('cs1'));
  it('toJson should return correct shape', () => expect(model.toJson().courseStreamName).toBe('Stream A'));
  it('fromJson should create instance', () => {
    const m = CourseStreamModel.fromJson({ courseStreamId: 'cs2', organizationId: 'org2', courseStreamName: 'Stream B', description: 'D' });
    expect(m).toBeInstanceOf(CourseStreamModel);
  });
});
