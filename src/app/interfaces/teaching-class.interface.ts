export interface TeachingClass {
  teachingClassId: string;
  gradeStreamId: string;
  subject: string;
  totalStudents: number;
  classRoomNumber: string;
  organizationId: string;
  teacherId: string;
}

export interface CreateTeachingClassRequest {
  gradeStreamId: string;
  subject: string;
  totalStudents: number;
  classRoomNumber: string;
  organizationId: string;
  teacherId: string;
}