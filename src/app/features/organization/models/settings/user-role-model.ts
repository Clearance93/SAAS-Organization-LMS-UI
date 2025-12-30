import { UserRole } from "../../../../interfaces/schools/settings/user-role";

export class UserRoleModel implements UserRole{
    constructor(
    public id: string,
    public name: string,
    public permissions: string[],
    public userCount?: number
  ) {}

  static fromJson(json: any): UserRoleModel {
    return new UserRoleModel(
      json.id,
      json.name,
      json.permissions || [],
      json.userCount
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      permissions: this.permissions,
      userCount: this.userCount
    };
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  addPermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      this.permissions.push(permission);
    }
  }

  removePermission(permission: string): void {
    this.permissions = this.permissions.filter(p => p !== permission);
  }
}

