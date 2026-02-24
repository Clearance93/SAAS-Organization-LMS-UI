export interface Grade {
  gradeId: string;
  gradeName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: number;
  subjectName: string;
  subjectCode: string;
  gradeId: number;
  teacherId: number;
  teacherName: string;
}

export interface StudentSubjectEnrollment {
  studentId: number;
  subjectId: number;
  gradeId: number;
  enrolledAt: string;
}

export interface EnrollSubjectDto {
  studentId: number;
  subjectIds: number[];
  gradeId: number;
  organizationId: number;
}