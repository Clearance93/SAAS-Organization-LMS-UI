import { Course } from "./course";
import { ModuleItem } from "./module-item";

export interface CourseSettings {
    courses: Course[];
    modules: ModuleItem[];
    totalActive: number;
}
