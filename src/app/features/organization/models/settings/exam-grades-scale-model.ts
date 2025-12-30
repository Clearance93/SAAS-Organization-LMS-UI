import { IExamGradeScale } from "../../../../interfaces/settings/iexam-grade-scale";

export class ExamGradesScaleModel implements IExamGradeScale {
    constructor(
        public examGradeScaleId: string,
        public organizationId: string,
        public passMark: number,
        public distinctionMark: number,
        public excellentMark: number,
        public averageMark: number,
        public poorMark: number
    ) {}

    static fromJson(json: any): ExamGradesScaleModel {
        return new ExamGradesScaleModel(
            json.examGradeScaleId,
            json.organizationId,
            json.passMark,
            json.distinctionMark,
            json.excellentMark,
            json.averageMark,
            json.poorMark
        );
    }

    toJson(): any {
        return {
            examGradeScaleId: this.examGradeScaleId,
            organizationId: this.organizationId,
            passMark: this.passMark,
            distinctionMark: this.distinctionMark,
            excellentMark: this.excellentMark,
            averageMark: this.averageMark,
            poorMark: this.poorMark
        };
    }
}
