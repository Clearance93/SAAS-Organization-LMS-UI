import { ExamType } from "../../../../interfaces/schools/settings/exam-type";

export class ExamTypeModel implements ExamType{
    constructor(
        public id: string,
        public name: string,
        public gradingScaleId?: string | null,
        public isAutoMarked?: boolean
    ) {}

    static fromJson(json: any): ExamTypeModel {
        return new ExamTypeModel (
            json.id,
            json.name,
            json.gradingScaleId,
            json.isAutoMarked
        );
    }

    toJson(): any {
        return {
            id: this.id,
            name: this.name,
            gradingScaleId: this.gradingScaleId,
            isAutomarked: this.isAutoMarked
        }
    }
}
