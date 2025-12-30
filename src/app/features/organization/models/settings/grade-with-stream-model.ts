import { GradeWithStreamDto } from "../../../../interfaces/settings/grade-with-stream-dto-";

export class GradeWithStreamModel implements GradeWithStreamDto{
    gradeId: string;
    gradeName: string;
    streamId: string;
    teacherId: string;
    streamName: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<GradeWithStreamDto> = {}) {
        this.gradeId = data.gradeId || '00000000-0000-0000-0000-000000000000';
        this.gradeName = data.gradeName || '';
        this.streamId = data.streamId || '00000000-0000-0000-0000-000000000000';
        this.teacherId = data.teacherId || '00000000-0000-0000-0000-000000000000';
        this.streamName = data.streamName || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    static fromJson(json: any): GradeWithStreamModel {
        return new GradeWithStreamModel(
            {
                gradeId: json.gradeId || json.GradeId,
                gradeName: json.gradeName || json.GradeName,
                streamId: json.streamId || json.StreamId,
                teacherId: json.teacherId || json.TeacherId,
                streamName: json.streamName || json.StreamName,
                createdAt: json.createdAt ? new Date(json.CreatedAt) : undefined,
                updatedAt: json.updatedAt ? new Date(json.UpdatedAt) : undefined
            }
        );
    }

    toJson(): any {
        return {
            gradeid: this.gradeId,
            gradeName: this.gradeName,
            streamId: this.streamId,
            teacherid: this.teacherId,
            streamName: this.streamName,
            createdAt: this.createdAt || new Date(),
            updatedAt: this.updatedAt || new Date()
        };
    }

}
