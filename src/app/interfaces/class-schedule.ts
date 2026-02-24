export interface StreamResponse {
  gradeId: string;
  gradeName: string | null;
  streamId: string;
  teacherEmail: string | null;
  streamName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassScheduleDto {
  classScheduleId: string;
  date: string;
  startTime: string;
  endTime: string;
  classRoomNumber?: string;
  gradeStreamId: string;
  status: ScheduleStatus;
  teachingClassId: string;
  organizationId: string;
  teacherId: string;
}

export enum ScheduleStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}