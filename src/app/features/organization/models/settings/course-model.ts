import { Course } from "../../../../interfaces/schools/settings/course";

export class CourseModel implements Course{
    constructor(
        public id: string,
        public title: string,
        public gradeIds: string[],
        public status: 'Active'| 'Inactive',
        public code?: string,
        public departmentId?: string | null,
        public teacherId?: string | null,
        public description?: string,
        public duration?: string,
        public durationWeeks?: number,
        public createdAt?: string
    ) {}

    static fromJson(json: any): CourseModel {
        return new CourseModel(
            json.id,
            json.title,
            json.gradeids || [],
            json.status,
            json.coe,
            json.departmentId,
            json.teacherId,
            json.description,
            json.durationWeeks,
            json.createdAt
        );
    }

    toJson(): any {
        return {
            id: this.id,
            title: this.title,
            gradeIds: this.gradeIds,
            status: this.status,
            code: this.code,
            departmentId: this.departmentId,
            teacherId: this.teacherId,
            description: this.description,
            durationWeeks: this.durationWeeks,
            createdAt: this.createdAt
        };
    }

    get isActive(): boolean {
        return this.status === 'Active';
    }
}
