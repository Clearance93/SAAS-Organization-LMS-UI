export interface Exam {
    id: string;
    examTypeId: string;
    courseId?: string | null;
    gradeId?: string | null;
    startAt: string;
    endAt: string;
    instructions?: string;
    status: 'Scheduled' | 'Open' | 'Closed' | 'Archieved';
}
