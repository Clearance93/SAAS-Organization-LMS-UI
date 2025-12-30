import { Exam } from "./exam";
import { ExamType } from "./exam-type";
import { GradingScale } from "./grading-scale";

export interface ExamSettings {
    examType: ExamType[];
    gradingScales: GradingScale[];
    upcomingExams: Exam[];
}
