import { SchoolSubject } from "../../../../interfaces/settings/school-subject";

export class SchoolSubjectModel implements SchoolSubject{
    constructor(
        public subjectId: string,
        public courseStreamId: string,
        public subjectName: string,
        public gradeLevel: string
    ) {}

    static fromJson(json: any): SchoolSubjectModel {
        return new SchoolSubjectModel(
            json.subjectId,
            json.courseStreamId,
            json.subjectName,
            json.gradeLevel
        );
    }

    toJson(): any {
        return {
            courseStreamId: this.courseStreamId,
            subjectId: this.subjectId,
            subjectName: this.subjectName,
            gradeLevel: this.gradeLevel
        };
    }
}
