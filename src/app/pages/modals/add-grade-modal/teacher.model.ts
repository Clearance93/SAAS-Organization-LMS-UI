export interface Teacher {
    teacherId: string;
    firstName: string;
    lastName: string;
    teacherEmail: string;
    teacherProfilePicture: string;
    isDeleted: string;
    isActive: string;
    createdAt: Date;
    updatedAt: Date;
    organizationSetupId: string;
}

export class TeacherModel implements Teacher {
    constructor(
        public teacherId: string,
        public firstName: string,
        public lastName: string,
        public teacherEmail: string,
        public teacherProfilePicture: string,
        public isDeleted: string,
        public isActive: string,
        public createdAt: Date,
        public updatedAt: Date,
        public organizationSetupId: string
    ) {}

    static fromJson(json: any): Teacher {
        console.log('Raw teacher JSON from API:', json); 
        return new TeacherModel(
            json.teacherId,
            json.firstName,
            json.lastName,
            json.teacherEmail,
            json.teacherProfilePicture,
            json.isDeleted,
            json.isActive,
            new Date(json.createdAt),
            new Date(json.updatedAt),
            json.organizationSetupId
        );
    }
}