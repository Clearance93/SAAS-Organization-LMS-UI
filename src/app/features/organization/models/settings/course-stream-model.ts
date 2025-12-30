import { CourseStream } from "../../../../interfaces/settings/course-stream";

export class CourseStreamModel implements CourseStream {
    constructor(
        public courseStreamId: string,
        public organizationId: string,
        public courseStreamName: string,
        public description: string
    ) {}

    static fromJson(json: any): CourseStreamModel {
        return new CourseStreamModel(
            json.courseStreamId,
            json.organizationId,
            json.courseStreamName,
            json.description
        );
    }

    toJson(): any {
        return {
            subjectId: this.courseStreamId,
            courseid: this.organizationId,
            courseStreamName: this.courseStreamName,
            gradeLevel: this.description
        };
    }
}