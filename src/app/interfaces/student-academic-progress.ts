export interface StudentAcademicProgress {
  academicProgressId: string;
  organizationId: string;
  studentId: string;
  schoolTerm: string;
  isCurrentTerm: boolean;
  subject: string;
  percentage: number;
  overallPerfomance: number;
}
