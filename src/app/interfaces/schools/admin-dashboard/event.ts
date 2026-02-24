export interface Event {
  eventId?: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  eventType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEventDto {
  organizationId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  eventType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEventDto {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  eventType: string;
  updatedAt: string;
}