export interface Course {
    id: string;
    title: string;
    code?: string;
    gradeIds?: string[];
    departmentId?: string | null;
    teacherId?: string | null;
    status: 'Active'| 'Inactive';
    description?: string;
    durationWeeks?: number;
    createdAt?: string;
}
