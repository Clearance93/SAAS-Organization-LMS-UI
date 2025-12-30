import { UserRole } from "./user-role";

export interface UserSettings {
    roles: UserRole[];
    totalUsers: number;
}
