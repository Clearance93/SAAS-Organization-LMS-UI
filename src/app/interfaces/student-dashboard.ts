export interface StudentProfile {
  studentId: string;
  studentName: string;
  currentGrade: string;
  currentStream: string;
  profilePicture?: string;
  email: string;
  phone?: string;
  parentContact?: string;
}

export interface StudentSchedule {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  status: 'completed' | 'current' | 'upcoming';
  date: Date;
}

export interface SubjectGrade {
  subjectId: string;
  name: string;
  grade: number;
  letterGrade?: string;
  credits?: number;
  teacher: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'completed' | 'overdue';
  points: number;
  grade?: string;
  attachments?: AssignmentAttachment[];
  submissionUrl?: string;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  totalDays: number;
  percentage: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: Date;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  author: string;
  category: string;
}

export interface StudentEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  location: string;
  type: 'competition' | 'meeting' | 'event' | 'exam' | 'holiday';
  isOptional: boolean;
}

export interface LibraryStats {
  booksRead: number;
  hoursRead: number;
  readingGoal: number;
  currentBooks: number;
  overdueBooks: number;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  todaySchedule: StudentSchedule[];
  overallGrade: number;
  subjectGrades: SubjectGrade[];
  assignments: Assignment[];
  attendanceStats: AttendanceStats;
  announcements: Announcement[];
  upcomingEvents: StudentEvent[];
  libraryStats: LibraryStats;
}