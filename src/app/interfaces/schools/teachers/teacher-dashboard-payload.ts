export interface TeacherDashboardPayload {
  teacherId: string;
  teacherName: string;
  teacherProfilePicture: string;
  teachingClassid: string;
  className: string | null;
  subject: string | null;
  totalStudents: number;
  dailyPresent: number;
  dailyAbsent: number;
  classPerformance: number;
  nextClassStartTime: string | null;
  nextClassEndTime: string | null;
  assignmentId: string;
  assignmentTitle: string | null;
  assignmentDueDate: string | null;
  assignmentSubject: string | null;
  assignmentSubmittedCount: number;
  assignmentTotalStudents: number;
  assignmentProgress: string;
}