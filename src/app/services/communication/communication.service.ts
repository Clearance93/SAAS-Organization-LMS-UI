import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of } from 'rxjs';
import { Message, CreateMessageDto, MessageThread, BroadcastMessageDto } from '../../interfaces/communication/message';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private apiUrl = 'https://localhost:7270/api/SchoolDashboards';
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMessages(organizationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/getMessages/${organizationId}`)
      .pipe(
        tap(messages => {
          this.messagesSubject.next(messages);
          this.updateUnreadCount(messages);
        }),
        catchError(error => {
          console.error('Error loading messages:', error);
          const emptyMessages: Message[] = [];
          this.messagesSubject.next(emptyMessages);
          return of(emptyMessages);
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
    return this.http.post<Message>(`${this.apiUrl}/message`, payload)
      .pipe(
        tap(newMessage => {
          const currentMessages = this.messagesSubject.value;
          this.messagesSubject.next([newMessage, ...currentMessages]);
        }),
        catchError(this.handleError)
      );
  }

  markAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/markAsRead/${messageId}`, {})
      .pipe(
        tap(() => {
          const messages = this.messagesSubject.value.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          );
          this.messagesSubject.next(messages);
          this.updateUnreadCount(messages);
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
      broadcastId: broadcastData.broadcastId,
      senderEmail: broadcastData.senderEmail,
      role: broadcastData.role,
      subject: broadcastData.subject,
      organizationId: broadcastData.organizationId,
      createdAt: broadcastData.createdAt
    };

    return this.http.post(`${this.apiUrl}/broadcastMessages`, payload)
      .pipe(
        tap(response => {
          console.log('Broadcast message sent:', response);
          // Refresh messages after broadcast
          this.getMessages(broadcastData.organizationId).subscribe();
        }),
        catchError(this.handleError)
      );
  }

  private handleError = (error: any): Observable<never> => {
    console.error('Communication service error:', error);
    throw error;
  }
}