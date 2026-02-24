export interface Activity {
  activityId?: string;
  organizationId: string;
  email: string;
  fullName?: string;
  actionDescription: string;
  activityType: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateActivityDto {
  organizationId: string;
  email: string;
  actionDescription: string;
  activityType: string;
  createdAt: string;
  isActive: boolean;
}

export interface UpdateActivityDto {
  actionDescription: string;
  activityType: string;
}