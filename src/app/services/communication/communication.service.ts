import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of } from 'rxjs';
import { Message, CreateMessageDto, MessageThread, BroadcastMessageDto } from '../../interfaces/communication/message';

export interface ChatMessage {
  backToBackCommunicationId: string;
  emojis?: string;
  file?: string;
  voiceNote?: string;
  text: string;
  senderId: string;
  receiverId: string;
  organizationId: string;
  dateStamp: string;
  timeStamp: string;
  messageId: string;
  isRead: boolean;
  isBroadcast: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private apiUrl = 'https://localhost:7270/api/SchoolDashboards';
  private httpApiUrl = 'http://localhost:7270/api/SchoolDashboards';
  private chatApiUrl = 'https://localhost:7270/api/MeetingsUrl';
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMessages(organizationId: string, senderId: string): Observable<Message[]> {
    // Try HTTPS first, fallback to HTTP if SSL fails
    return this.http.get<Message[]>(`${this.apiUrl}/getMessages/${organizationId}/${senderId}`)
      .pipe(
        tap(messages => {
          this.messagesSubject.next(messages);
          this.updateUnreadCount(messages);
        }),
        catchError(error => {
          console.warn('HTTPS failed for messages, trying HTTP:', error.message);
          // Fallback to HTTP
          return this.http.get<Message[]>(`${this.httpApiUrl}/getMessages/${organizationId}/${senderId}`)
            .pipe(
              tap(messages => {
                this.messagesSubject.next(messages);
                this.updateUnreadCount(messages);
              }),
              catchError(httpError => {
                console.error('Error loading messages:', httpError);
                const emptyMessages: Message[] = [];
                this.messagesSubject.next(emptyMessages);
                return of(emptyMessages);
              })
            );
        })
      );
  }

  getBroadcastMessages(userRole: string): Observable<Message[]> {
    // Try HTTPS first, fallback to HTTP if SSL fails
    return this.http.get<Message[]>(`${this.apiUrl}/broadcastsMessages/${userRole}`)
      .pipe(
        catchError(error => {
          console.warn('HTTPS failed for broadcast messages, trying HTTP:', error.message);
          // Fallback to HTTP
          return this.http.get<Message[]>(`${this.httpApiUrl}/broadcastsMessages/${userRole}`)
            .pipe(
              catchError(httpError => {
                console.error('Error loading broadcast messages:', httpError);
                return of([]);
              })
            );
        })
      );
  }

  getIndividualMessages(userId: string): Observable<Message[]> {
    // Try HTTPS first, fallback to HTTP if SSL fails
    return this.http.get<Message[]>(`${this.apiUrl}/individualMessages/${userId}`)
      .pipe(
        catchError(error => {
          console.warn('HTTPS failed for individual messages, trying HTTP:', error.message);
          // Fallback to HTTP
          return this.http.get<Message[]>(`${this.httpApiUrl}/individualMessages/${userId}`)
            .pipe(
              catchError(httpError => {
                console.error('Error loading individual messages:', httpError);
                return of([]);
              })
            );
        })
      );
  }

  archiveMessage(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/archiveMessage/${messageId}`, {})
      .pipe(
        catchError(error => {
          console.error('Error archiving message:', error);
          throw error;
        })
      );
  }

  getArchivedMessages(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/archivedMessages/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error loading archived messages:', error);
          return of([]);
        })
      );
  }

  sendMessage(messageData: CreateMessageDto): Observable<Message> {
    const payload = {
      createMessageId: messageData.createMessageId,
      senderEmail: messageData.senderEmail,
      organizationId: messageData.organizationId,
      recipientId: messageData.recipientId,
      recipientRole: messageData.recipientRole,
      subject: messageData.subject,
      content: messageData.content,
      createdAt: messageData.createdAt
    };

    console.log('Sending message payload:', payload);
    // Try HTTPS first, fallback to HTTP if it fails
    return this.http.post<Message>(`${this.apiUrl}/message`, payload)
      .pipe(
        tap(newMessage => {
          const currentMessages = this.messagesSubject.value;
          this.messagesSubject.next([newMessage, ...currentMessages]);
        }),
        catchError(error => {
          console.warn('HTTPS failed for message, trying HTTP:', error.message);
          // Fallback to HTTP
          return this.http.post<Message>(`${this.httpApiUrl}/message`, payload)
            .pipe(
              tap(newMessage => {
                const currentMessages = this.messagesSubject.value;
                this.messagesSubject.next([newMessage, ...currentMessages]);
              }),
              catchError(this.handleError)
            );
        })
      );
  }

  markAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/markAsRead/${messageId}`, {})
      .pipe(
        tap(() => {
          const messages = this.messagesSubject.value.map(msg => 
            msg.messageId === messageId ? { ...msg, isRead: true } : msg
          );
          this.messagesSubject.next(messages);
          this.updateUnreadCount(messages);
          // Decrement unread count immediately
          const currentCount = this.unreadCountSubject.value;
          if (currentCount > 0) {
            this.unreadCountSubject.next(currentCount - 1);
          }
        }),
        catchError(this.handleError)
      );
  }

  getUnreadCount(organizationId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/getUnreadCount/${organizationId}`)
      .pipe(
        tap(count => this.unreadCountSubject.next(count)),
        catchError(error => {
          console.error('Error loading unread count:', error);
          this.unreadCountSubject.next(0);
          return of(0);
        })
      );
  }

  private updateUnreadCount(messages: Message[]): void {
    const unreadCount = messages.filter(msg => !msg.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  sendBroadcastMessage(broadcastData: BroadcastMessageDto): Observable<any> {
    const payload = {
      content: broadcastData.content,
      senderEmail: broadcastData.senderEmail,
      role: broadcastData.role,
      subject: broadcastData.subject,
      organizationId: broadcastData.organizationId,
      createdAt: broadcastData.createdAt
    };

    console.log('Sending broadcast payload:', JSON.stringify(payload, null, 2));
    console.log('API URL:', `${this.apiUrl}/broadcastMessages`);

    // Try HTTPS first, fallback to HTTP if it fails
    return this.http.post(`${this.apiUrl}/broadcastMessages`, payload)
      .pipe(
        tap(response => {
          console.log('Broadcast message sent:', response);
        }),
        catchError(error => {
          console.warn('HTTPS failed, trying HTTP:', error.message);
          // Fallback to HTTP
          return this.http.post(`${this.httpApiUrl}/broadcastMessages`, payload)
            .pipe(
              tap(response => {
                console.log('Broadcast message sent via HTTP:', response);
              }),
              catchError(httpError => {
                console.error('Both HTTPS and HTTP failed:', httpError);
                return this.handleError(httpError);
              })
            );
        })
      );
  }

  private handleError = (error: any): Observable<never> => {
    console.error('Communication service error:', error);
    throw error;
  }

  addToChat(chatData: ChatMessage): Observable<any> {
    return this.http.post(`${this.chatApiUrl}/addToChat`, chatData).pipe(
      catchError(error => {
        console.error('Error adding to chat:', error);
        throw error;
      })
    );
  }

  getChatHistory(messageId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.chatApiUrl}/chatHitsory/${messageId}`).pipe(
      catchError(error => {
        console.error('Error loading chat history:', error);
        return of([]);
      })
    );
  }
}