import { ClassStream } from "./class-stream";
import { Department } from "./department";
import { GradeLevel } from "./grade-level";

export interface AcademicSettings {
    grades: GradeLevel[];
    stream: ClassStream[];
    departments: Department[];
}
