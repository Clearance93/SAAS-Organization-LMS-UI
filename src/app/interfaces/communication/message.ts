export interface Message {
  messageId: string;
  organizationId: string;
  senderId: string;
  senderName: string;
  senderRole: string | null;
  recipientId: string | null;
  recipientName: string | null;
  recipientRole: string | null;
  subject: string;
  content: string;
  timeStamp: string;
  isDeleted: boolean;
  isModified: boolean;
  isRead: boolean;
  isArchived?: boolean;
}

export interface CreateMessageDto {
  createMessageId: string;
  senderEmail: string;
  organizationId: string;
  recipientId: string;
  recipientRole: string;
  subject: string;
  content: string;
  createdAt: string;
}

export interface BroadcastMessageDto {
  content: string;
  senderEmail: string;
  role: string;
  subject: string;
  organizationId: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}