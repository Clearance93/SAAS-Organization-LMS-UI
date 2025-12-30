export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'teacher' | 'student' | 'staff' | 'guest';
  recipientId: string;
  recipientName: string;
  recipientRole: 'admin' | 'teacher' | 'student' | 'staff' | 'guest';
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  organizationId: string;
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
  broadcastId: string;
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