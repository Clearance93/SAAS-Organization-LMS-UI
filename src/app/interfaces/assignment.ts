export interface AssignmentDto {
  assignmentId: string;
  organizationId: string;
  name: string;
  teacherId: string;
  assignmentTitle: string;
  assignmentDescription: string;
  dueDate: string;
  assignmentMarks: number;
  gradeStreamId: string;
  assignmentSubject: string;
  createdDate?: string;
  assignmentFile?: string;
  teacherRubricFile?: string;
}

export interface AssignmentResponse {
  assignmentId: string;
  assignmentTitle: string;
  assignmentDueDate: string;
  assignmentSubject: string;
  assignmentSubmittedCount: number;
  assignmentTotalStudents: number;
}