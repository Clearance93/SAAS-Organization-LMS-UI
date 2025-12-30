import { GradeLevel } from "../../../../interfaces/schools/settings/grade-level";

export class GradeLevelModel implements GradeLevel{
    constructor(
        public id: string,
        public name: string,
        public order: number,
        public active: boolean
    ) {}

    static fromJson(json: any): GradeLevelModel {
        return new GradeLevelModel(
            json.id,
            json.name,
            json.order,
            json.active
        )
    }

    toJson(): any {
        return {
            id: this.id,
            name: this.name,
            order: this.order,
            active: this.active
        }
    }
}
