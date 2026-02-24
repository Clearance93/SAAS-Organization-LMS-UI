export interface LeadershipProgramDto {
  programeId: string;
  programName: string;
  programType: string;
  description: string;
  organizationId: string;
  adminId: string;
  startDate: string;
  maxParticipants: number;
  createdAt: string;
  isActive: boolean;
}

export interface CreateLeadershipProgramDto {
  programName: string;
  programType: string;
  description: string;
  organizationId: string;
  adminId: string;
  startDate: string;
  maxParticipants: number;
}

export interface EnrollParticipantDto {
  programId: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  department: string;
  organizationId: string;
}