import { GradeRange } from "./grade-range";

export interface GradingScale {
    id: string;
    name: string;
    passMark: number;
    distinctionMark: number;
    grades: GradeRange[];
}
