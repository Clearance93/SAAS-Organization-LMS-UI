import { Streams } from "../../../../interfaces/settings/streams";

export class StreamsModels implements Streams {
    constructor(
        public streamId: string,
        public streamName: string,
        public gradeId: string,
        public teacherId: string,
        public isActive: string,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    static fromJson(json: any): StreamsModels {
        console.log('Raw stream JSON from API:', json); 
        return new StreamsModels(
            json.streamId,
            json.streamName,
            json.gradeId,
            json.teacherId,
            json.isActive,
            new Date(json.createdAt),
            new Date(json.updatedAt)
        );
    }

}
