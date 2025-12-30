export interface ExamType {
    id: string;
    name: string;
    gradingScaleId?: string | null;
    isAutoMarked?: boolean;
}
