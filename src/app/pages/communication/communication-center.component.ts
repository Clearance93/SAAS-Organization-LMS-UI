import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommunicationService, ChatMessage } from '../../services/communication/communication.service';
import { AdminDashboardService } from '../../services/schoolDashboards/admin-dashboard.service';
import { UserService, User } from '../../services/communication/user.service';
import { Message, CreateMessageDto, BroadcastMessageDto } from '../../interfaces/communication/message';
import { RoleNavigationService } from '../../services/role-navigation.service';
import { SafePipe } from '../../pipes/safe.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-communication-center',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  templateUrl: './communication-center.component.html',
  styleUrls: ['./communication-center.component.css']
})
export class CommunicationCenterComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  sentMessages: Message[] = [];
  receivedMessages: Message[] = [];
  broadcastMessages: Message[] = [];
  privateMessages: Message[] = [];
  selectedMessage: Message | null = null;
  isComposing = false;
  organizationId: string = '';
  userId: string = '';
  currentUserRole: string = '';
  currentFolder: 'sent' | 'received' = 'received';
  receivedSubFolder: 'all' | 'private' | 'broadcast' = 'all';
  unreadCount = 0;
  
  newMessage = {
    recipientRole: 'student',
    recipientId: '',
    subject: '',
    content: '',
    isBroadcast: false
  };
  
  availableUsers: User[] = [];
  isLoadingUsers = false;
  replyText: string = '';
  showEmojiPicker: boolean = false;
  attachedFile: File | null = null;
  attachedFiles: File[] = [];
  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  recordedAudio: Blob | null = null;
  tempReplies: any[] = [];
  replyAttachments: Map<string, File[]> = new Map();
  voiceNotes: Map<string, Blob> = new Map();
  showDocumentViewer: boolean = false;
  currentDocumentUrl: string = '';
  currentDocumentName: string = '';
  currentDocumentType: string = '';
  maxFiles: number = 10;
  chatHistory: ChatMessage[] = [];
  isLoadingChat: boolean = false;
  newMessagesCount: number = 0;
  messageNotifications: Map<string, number> = new Map();

  constructor(
    private communicationService: CommunicationService,
    private adminService: AdminDashboardService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private roleNav: RoleNavigationService
  ) {}

  ngOnInit() {
    this.loadUserContext();
    setTimeout(() => {
      if (this.userId && this.organizationId) {
        this.loadAllMessages();
        this.loadUnreadCount();
      } else {
        console.warn('User context not fully loaded, retrying...');
        this.loadUserContext();
        setTimeout(() => {
          this.loadAllMessages();
          this.loadUnreadCount();
        }, 500);
      }
    }, 100);
    this.onRoleChange(); 
  }

  ngOnDestroy() {
  }

  loadUserContext() {
    // Get role from query params first
    this.route.queryParams.subscribe(params => {
      this.currentUserRole = params['role'] || this.detectUserRole();
      if (params['organizationId']) {
        this.organizationId = params['organizationId'];
      }
    });

    // Get organizationId and userId from localStorage
    if (typeof localStorage !== 'undefined') {
      if (!this.organizationId) {
        this.organizationId = localStorage.getItem('organizationId') || '';
      }
      
      if (this.currentUserRole === 'student') {
        const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
        this.userId = studentProfile.studentId || '';
      } else if (this.currentUserRole === 'teacher') {
        this.userId = localStorage.getItem('roleUserId') || localStorage.getItem('teacherId') || '';
      } else {
        this.userId = localStorage.getItem('adminId') || localStorage.getItem('userId') || '';
      }
    }
    
    console.log('Communication Center - Organization ID:', this.organizationId);
    console.log('Communication Center - User ID:', this.userId);
    console.log('Communication Center - User Role:', this.currentUserRole);
  }

  detectUserRole(): string {
    if (typeof localStorage === 'undefined') return 'admin';
    
    // Check if student profile exists
    const studentProfile = localStorage.getItem('studentProfile');
    if (studentProfile) {
      try {
        const profile = JSON.parse(studentProfile);
        if (profile.studentId) return 'student';
      } catch (e) {}
    }
    
    // Check if teacher
    const roleUserId = localStorage.getItem('roleUserId');
    const teacherId = localStorage.getItem('teacherId');
    if (roleUserId || teacherId) return 'teacher';
    
    // Check userRole in localStorage
    const userRole = localStorage.getItem('userRole');
    if (userRole) return userRole.toLowerCase();
    
    // Default to admin
    return 'admin';
  }

  loadMessages() {
    if (this.userId) {
      this.communicationService.getIndividualMessages(this.userId).subscribe({
        next: (messages) => {
          this.sentMessages = messages.filter(msg => msg.senderId === this.userId);
        },
        error: (error) => {
          console.error('Error loading sent messages:', error);
        }
      });
    }
  }

  loadAllMessages() {
    this.loadMessages();
    this.loadBroadcastMessages();
    this.loadPrivateMessages();
  }

  loadBroadcastMessages() {
    if (this.currentUserRole) {
      this.communicationService.getBroadcastMessages(this.currentUserRole).subscribe({
        next: (messages) => {
          this.broadcastMessages = messages;
        },
        error: (error) => {
          console.error('Error loading broadcast messages:', error);
        }
      });
    }
  }

  loadPrivateMessages() {
    if (this.userId) {
      this.communicationService.getIndividualMessages(this.userId).subscribe({
        next: (apiMessages) => {
          this.privateMessages = apiMessages.filter(msg => 
            msg.recipientId === this.userId && msg.senderId !== this.userId
          );
        },
        error: (error) => {
          console.error('Error loading private messages:', error);
          this.privateMessages = [];
        }
      });
    }
  }



  loadUnreadCount() {
    this.communicationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  selectMessage(message: Message) {
    this.selectedMessage = message;
    if (message.messageId) {
      this.messageNotifications.delete(message.messageId);
      this.loadChatHistory(message.messageId);
      this.markMessageAsRead(message.messageId);
    }
  }

  loadChatHistory(messageId: string) {
    this.communicationService.getChatHistory(messageId).subscribe({
      next: (history) => {
        this.chatHistory = history.sort((a, b) => 
          new Date(a.dateStamp + ' ' + a.timeStamp).getTime() - 
          new Date(b.dateStamp + ' ' + b.timeStamp).getTime()
        );
        this.isLoadingChat = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.chatHistory = [];
        this.isLoadingChat = false;
      }
    });
  }

  markMessageAsRead(messageId: string) {
    this.communicationService.markAsRead(messageId).subscribe({
      next: () => {
        this.updateLocalMessageReadStatus(messageId);
        this.loadUnreadCount();
      },
      error: (error) => console.error('Error marking as read:', error)
    });
  }

  markAsRead(messageId: string) {
    this.communicationService.markAsRead(messageId).subscribe({
      next: () => {
        console.log('Message marked as read');
        // Update local message arrays
        this.updateLocalMessageReadStatus(messageId);
        // Reload unread count
        this.loadUnreadCount();
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
  }

  private updateLocalMessageReadStatus(messageId: string) {
    // Update in all message arrays
    this.broadcastMessages = this.broadcastMessages.map(msg => 
      msg.messageId === messageId ? { ...msg, isRead: true } : msg
    );
    this.privateMessages = this.privateMessages.map(msg => 
      msg.messageId === messageId ? { ...msg, isRead: true } : msg
    );
    this.sentMessages = this.sentMessages.map(msg => 
      msg.messageId === messageId ? { ...msg, isRead: true } : msg
    );
    if (this.selectedMessage && this.selectedMessage.messageId === messageId) {
      this.selectedMessage = { ...this.selectedMessage, isRead: true };
    }
  }

  startComposing() {
    this.isComposing = true;
    this.selectedMessage = null;
  }

  cancelCompose() {
    this.isComposing = false;
    this.resetForm();
  }

  sendMessage() {
    if (!this.organizationId) return;

    if (this.newMessage.isBroadcast) {
      this.sendBroadcastMessage(this.organizationId);
    } else {
      this.sendIndividualMessage(this.organizationId);
    }
  }

  private getCurrentUserEmail(): string {
    let email = '';
    
    if (this.currentUserRole === 'student') {
      const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
      console.log('Student Profile:', studentProfile);
      email = studentProfile.studentBusinessEmail || studentProfile.email || '';
    } else if (this.currentUserRole === 'teacher') {
      const teacherProfile = JSON.parse(localStorage.getItem('teacherProfile') || '{}');
      console.log('Teacher Profile:', teacherProfile);
      email = teacherProfile.teacherBusinessEmail || teacherProfile.email || '';
    } else if (this.currentUserRole === 'admin') {
      const adminProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
      console.log('Admin Profile:', adminProfile);
      email = adminProfile.adminBusinessEmail || adminProfile.email || '';
    }
    
    if (!email) {
      console.warn('No email found in profile, checking userEmail fallback');
      email = localStorage.getItem('userEmail') || localStorage.getItem('adminEmail') || 'unknown@local';
    }
    
    console.log('Current User Email:', email, '| Role:', this.currentUserRole);
    return email;
  }

  private async compressAndEncodeFile(file: File): Promise<{name: string, data: string, type: string, size: number}> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const arrayBuffer = e.target.result;
        
        // Compress using gzip (browser CompressionStream API)
        const stream = new Blob([arrayBuffer]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const compressedBlob = await new Response(compressedStream).blob();
        
        // Convert compressed data to base64
        const compressedReader = new FileReader();
        compressedReader.onload = (ce: any) => {
          const base64 = ce.target.result.split(',')[1];
          resolve({
            name: file.name,
            data: `data:application/gzip;base64,${base64}`,
            type: file.type,
            size: compressedBlob.size
          });
        };
        compressedReader.readAsDataURL(compressedBlob);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private async sendIndividualMessage(orgId: string) {
    const senderEmail = this.getCurrentUserEmail();
    let content = this.newMessage.content;
    
    // Compress and encode files
    if (this.attachedFiles.length > 0) {
      for (const file of this.attachedFiles) {
        const compressed = await this.compressAndEncodeFile(file);
        content += `\n[FILE:${JSON.stringify(compressed)}]`;
      }
    }
    
    const messageData: CreateMessageDto = {
      createMessageId: crypto.randomUUID(),
      senderEmail: senderEmail,
      organizationId: orgId,
      recipientId: this.newMessage.recipientId,
      recipientRole: this.newMessage.recipientRole,
      subject: this.newMessage.subject,
      content: content,
      createdAt: new Date().toISOString()
    };

    this.communicationService.sendMessage(messageData).subscribe({
      next: (message) => {
        this.cancelCompose();
        this.loadMessages();
        this.loadPrivateMessages();
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  private sendBroadcastMessage(orgId: string) {
    const senderEmail = this.getCurrentUserEmail();
    console.log('Broadcast sender email:', senderEmail, 'Role:', this.currentUserRole);
    
    const broadcastData: BroadcastMessageDto = {
      content: this.newMessage.subject + '\n' + (this.newMessage.content || ''),
      senderEmail: senderEmail,
      role: this.newMessage.recipientRole,
      subject: this.newMessage.subject,
      organizationId: orgId,
      createdAt: new Date().toISOString()
    };

    console.log('Sending broadcast message with data:', broadcastData);

    this.communicationService.sendBroadcastMessage(broadcastData).subscribe({
      next: (response) => {
        console.log('Broadcast message sent successfully');
        this.cancelCompose();
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error sending broadcast message:', error);
      }
    });
  }

  private resetForm() {
    this.newMessage = {
      recipientRole: 'student',
      recipientId: '',
      subject: '',
      content: '',
      isBroadcast: false
    };
  }

  getAvailableUsers() {
    return this.availableUsers.filter(user => user.role === this.newMessage.recipientRole);
  }

  getAvailableRecipientRoles(): string[] {
    if (this.currentUserRole === 'student') {
      return ['student', 'teacher', 'admin'];
    }
    return ['student', 'learner', 'teacher', 'staff', 'guest'];
  }

  canSendBroadcast(): boolean {
    console.log('canSendBroadcast check - currentUserRole:', this.currentUserRole);
    return this.currentUserRole !== 'student'; // Only non-students can send broadcasts
  }

  onBroadcastToggle() {
    if (this.newMessage.isBroadcast) {
      this.newMessage.recipientId = '';
    }
  }

  onRoleChange() {
    if (!this.organizationId) return;
    
    this.isLoadingUsers = true;
    this.userService.getUsersByRole(this.organizationId, this.newMessage.recipientRole).subscribe({
      next: (users) => {
        this.availableUsers = users;
        this.newMessage.recipientId = ''; // Reset selection
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users by role:', error);
        this.availableUsers = [];
        this.isLoadingUsers = false;
      }
    });
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'student': 'All Students',
      'learner': 'All Learners',
      'teacher': 'All Teachers',
      'staff': 'All Staff Members',
      'guest': 'All Guests'
    };
    return roleNames[role] || `All ${role}s`;
  }

  loadUsers() {
    if (!this.organizationId) return;
    
    this.isLoadingUsers = true;
    this.userService.getAllUsers(this.organizationId).subscribe({
      next: (users) => {
        this.availableUsers = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.availableUsers = [];
        this.isLoadingUsers = false;
      }
    });
  }

  formatDate(date: string | Date | undefined | null): string {
    if (!date) return '';
    const d = (typeof date === 'string') ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  backToDashboard(): void {
    this.roleNav.navigateToDashboard();
  }

  getMessageTypeIcon(message: Message): string {
    // Check if it's a broadcast message (no specific recipient)
    if (!message.recipientId || !message.recipientName) {
      return '📢'; // Broadcast icon
    }
    return '✉️'; // Individual message icon
  }

  switchFolder(folder: 'sent' | 'received') {
    this.currentFolder = folder;
    this.selectedMessage = null;
  }

  switchReceivedSubFolder(subFolder: 'all' | 'private' | 'broadcast') {
    this.receivedSubFolder = subFolder;
    this.selectedMessage = null;
  }

  getCurrentMessages(): Message[] {
    if (this.currentFolder === 'sent') {
      return this.sentMessages;
    } else {
      if (this.receivedSubFolder === 'broadcast') {
        return this.broadcastMessages;
      } else if (this.receivedSubFolder === 'private') {
        return this.privateMessages;
      } else {
        return [...this.broadcastMessages, ...this.privateMessages].sort((a, b) => 
          new Date(b.timeStamp || '').getTime() - new Date(a.timeStamp || '').getTime()
        );
      }
    }
  }

  getUnreadCount(folder: 'sent' | 'received'): number {
    if (folder === 'received') {
      const allReceived = [...this.broadcastMessages, ...this.privateMessages];
      return allReceived.filter(msg => !msg.isRead).length;
    }
    return 0;
  }

  getSubFolderUnreadCount(subFolder: 'all' | 'private' | 'broadcast'): number {
    if (subFolder === 'broadcast') {
      return this.broadcastMessages.filter(msg => !msg.isRead).length;
    } else if (subFolder === 'private') {
      return this.privateMessages.filter(msg => !msg.isRead).length;
    } else {
      const allReceived = [...this.broadcastMessages, ...this.privateMessages];
      return allReceived.filter(msg => !msg.isRead).length;
    }
  }



  isMessageRead(message: Message): boolean {
    return message.isRead;
  }

  async replyToMessage() {
    if (!this.selectedMessage || !this.replyText.trim()) return;
    
    const senderEmail = this.getCurrentUserEmail();
    let content = this.replyText;
    
    // Compress and encode files
    if (this.attachedFiles.length > 0) {
      for (const file of this.attachedFiles) {
        const compressed = await this.compressAndEncodeFile(file);
        content += `\n[FILE:${JSON.stringify(compressed)}]`;
      }
    }
    
    const messageData: CreateMessageDto = {
      createMessageId: crypto.randomUUID(),
      senderEmail: senderEmail,
      organizationId: this.organizationId,
      recipientId: this.selectedMessage.senderId,
      recipientRole: this.selectedMessage.senderRole || 'student',
      subject: 'Re: ' + this.selectedMessage.subject,
      content: content,
      createdAt: new Date().toISOString()
    };

    this.communicationService.sendMessage(messageData).subscribe({
      next: (message) => {
        this.privateMessages.push(message);
        this.replyText = '';
        this.attachedFiles = [];
        this.recordedAudio = null;
        this.showEmojiPicker = false;
        this.loadPrivateMessages();
      },
      error: (error) => {
        console.error('Error sending reply:', error);
        alert('Failed to send reply.');
      }
    });
  }

  emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✅', '📚', '💡', '🙏', '👏', '🎯', '⭐', '💪', '🤔', '😎'];

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.replyText += emoji;
    this.showEmojiPicker = false;
  }

  onFileAttach(event: any) {
    const files = Array.from(event.target.files) as File[];
    const remainingSlots = this.maxFiles - this.attachedFiles.length;
    
    if (files.length > remainingSlots) {
      alert(`You can only attach up to ${this.maxFiles} files. ${remainingSlots} slots remaining.`);
      const filesToAdd = files.slice(0, remainingSlots);
      this.attachedFiles.push(...filesToAdd);
    } else {
      this.attachedFiles.push(...files);
    }
    
    event.target.value = '';
  }

  removeAttachment(index: number) {
    this.attachedFiles.splice(index, 1);
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.recordedAudio = new Blob(this.audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  removeVoiceNote() {
    this.recordedAudio = null;
    this.audioChunks = [];
  }

  async sendReply() {
    if (!this.selectedMessage || (!this.replyText.trim() && !this.recordedAudio && this.attachedFiles.length === 0)) return;
    
    const now = new Date();
    const chatData: ChatMessage = {
      backToBackCommunicationId: crypto.randomUUID(),
      text: this.replyText,
      senderId: this.userId,
      receiverId: this.selectedMessage.senderId,
      organizationId: this.organizationId,
      dateStamp: now.toISOString().split('T')[0],
      timeStamp: now.toTimeString().split(' ')[0].substring(0, 5),
      messageId: this.selectedMessage.messageId || '',
      isRead: false,
      isBroadcast: false,
      emojis: '',
      file: '',
      voiceNote: ''
    };

    if (this.attachedFiles.length > 0) {
      const file = this.attachedFiles[0];
      const compressed = await this.compressAndEncodeFile(file);
      chatData.file = JSON.stringify(compressed);
      this.sendChatMessage(chatData);
    } else if (this.recordedAudio) {
      const voiceFile = new File([this.recordedAudio], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      const compressed = await this.compressAndEncodeFile(voiceFile);
      chatData.voiceNote = JSON.stringify(compressed);
      this.sendChatMessage(chatData);
    } else {
      this.sendChatMessage(chatData);
    }
  }

  sendChatMessage(chatData: ChatMessage) {
    this.chatHistory.push(chatData);
    this.replyText = '';
    this.attachedFiles = [];
    this.recordedAudio = null;
    this.scrollToBottom();

    this.communicationService.addToChat(chatData).subscribe({
      next: () => {
        if (this.selectedMessage?.messageId) {
          this.loadChatHistory(this.selectedMessage.messageId);
        }
      },
      error: (error) => {
        console.error('Error sending reply:', error);
        this.chatHistory = this.chatHistory.filter(c => c.backToBackCommunicationId !== chatData.backToBackCommunicationId);
        alert('Failed to send reply.');
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  getGroupedMessages(): any[] {
    const grouped: any[] = [];
    let currentGroup: any = null;

    this.chatHistory.forEach((chat, index) => {
      const isSent = this.isSentByMe(chat);
      const currentTime = chat.timeStamp;
      const prevChat = index > 0 ? this.chatHistory[index - 1] : null;
      const timeDiff = prevChat ? this.getTimeDifferenceMinutes(prevChat.timeStamp, currentTime) : 999;
      
      if (!currentGroup || currentGroup.isSent !== isSent || timeDiff > 5) {
        currentGroup = {
          isSent: isSent,
          messages: [chat],
          showTime: true
        };
        grouped.push(currentGroup);
      } else {
        currentGroup.messages.push(chat);
      }
    });

    return grouped;
  }

  getTimeDifferenceMinutes(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return Math.abs((h2 * 60 + m2) - (h1 * 60 + m1));
  }

  getMessageNotificationCount(messageId: string): number {
    return this.messageNotifications.get(messageId) || 0;
  }

  isSentByMe(chat: ChatMessage): boolean {
    return chat.senderId === this.userId;
  }

  getMessageReplies(): Message[] {
    if (!this.selectedMessage) return [];
    return this.privateMessages.filter(msg => 
      msg.subject.includes('Re: ' + this.selectedMessage?.subject) &&
      ((msg.senderId === this.selectedMessage?.senderId && msg.recipientId === this.userId) ||
       (msg.recipientId === this.selectedMessage?.senderId && msg.senderId === this.userId))
    );
  }

  openAttachment(replyId: string, fileIndex: number = 0) {
    const files = this.replyAttachments.get(replyId);
    if (files && files[fileIndex]) {
      const file = files[fileIndex];
      this.currentDocumentUrl = URL.createObjectURL(file);
      this.currentDocumentName = file.name;
      this.currentDocumentType = file.type;
      this.showDocumentViewer = true;
    }
  }

  closeDocumentViewer() {
    this.showDocumentViewer = false;
    if (this.currentDocumentUrl) {
      URL.revokeObjectURL(this.currentDocumentUrl);
      this.currentDocumentUrl = '';
    }
  }

  downloadDocument() {
    const link = document.createElement('a');
    link.href = this.currentDocumentUrl;
    link.download = this.currentDocumentName;
    link.click();
  }

  playVoiceNote(replyId: string) {
    const audio = this.voiceNotes.get(replyId);
    if (audio) {
      const url = URL.createObjectURL(audio);
      const audioElement = new Audio(url);
      audioElement.play();
    }
  }

  playChatVoiceNote(voiceNoteData: string) {
    if (!voiceNoteData) return;
    
    try {
      const fileData = JSON.parse(voiceNoteData);
      this.viewAttachment(fileData);
    } catch (e) {
      Swal.fire({
        title: 'Voice Note',
        html: `<div style="text-align: left;">
          <p><strong>Voice note attached</strong></p>
          <p style="color: #6b7280; font-size: 0.9rem;">Old format - file not available.</p>
        </div>`,
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  openChatFile(fileName: string) {
    if (!fileName) return;
    
    try {
      const fileData = JSON.parse(fileName);
      this.viewAttachment(fileData);
    } catch (e) {
      Swal.fire({
        title: 'File Attachment',
        html: `<div style="text-align: left;">
          <p><strong>File:</strong> ${fileName}</p>
          <p style="color: #6b7280; font-size: 0.9rem;">Old format - file not available.</p>
        </div>`,
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const pdfExts = ['pdf'];
    
    if (ext && imageExts.includes(ext)) return 'image/' + ext;
    if (ext && pdfExts.includes(ext)) return 'application/pdf';
    return 'application/octet-stream';
  }

  getMessageAttachments(message: Message): {name: string, data: string, type: string}[] {
    if (!message.content) return [];
    const lines = message.content.split('\n');
    const attachments: {name: string, data: string, type: string}[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check if line starts with [FILE: and ends with ]
      if (line.startsWith('[FILE:') && line.endsWith(']')) {
        try {
          const fileData = line.substring(6, line.length - 1);
          const parsed = JSON.parse(fileData);
          attachments.push(parsed);
        } catch (e) {
          console.error('Error parsing file data:', e);
        }
      }
      // Also check for old format (just filename)
      else if (line.match(/\.(jpeg|jpg|png|gif|pdf|docx?|xlsx?|pptx?|txt|webm|mp3|mp4)$/i)) {
        attachments.push({name: line, data: '', type: ''});
      }
    }
    return attachments;
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📃';
      case 'xls': case 'xlsx': return '📈';
      case 'ppt': case 'pptx': return '📊';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'mp3': case 'wav': case 'ogg': return '🎵';
      case 'webm': return '🎧';
      case 'mp4': case 'avi': case 'mov': return '🎥';
      default: return '📎';
    }
  }

  viewAttachment(file: {name: string, data: string, type: string}) {
    // Decompress and display
    if (file.data.startsWith('data:application/gzip')) {
      this.decompressAndView(file);
    } else {
      // Fallback for non-compressed files
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['mp3', 'wav', 'ogg', 'webm'].includes(ext || '')) {
        this.currentDocumentUrl = file.data;
        this.currentDocumentName = file.name;
        this.currentDocumentType = 'audio';
        this.showDocumentViewer = true;
      } else if (['mp4', 'avi', 'mov'].includes(ext || '')) {
        this.currentDocumentUrl = file.data;
        this.currentDocumentName = file.name;
        this.currentDocumentType = 'video';
        this.showDocumentViewer = true;
      } else if (['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(ext || '')) {
        this.currentDocumentUrl = file.data;
        this.currentDocumentName = file.name;
        this.currentDocumentType = this.getFileType(file.name);
        this.showDocumentViewer = true;
      } else {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
      }
    }
  }

  private async decompressAndView(file: {name: string, data: string, type: string}) {
    const base64 = file.data.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const stream = new Blob([bytes]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    const decompressedBlob = await new Response(decompressedStream).blob();
    
    const url = URL.createObjectURL(decompressedBlob);
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['mp3', 'wav', 'ogg', 'webm'].includes(ext || '')) {
      this.currentDocumentType = 'audio';
    } else if (['mp4', 'avi', 'mov'].includes(ext || '')) {
      this.currentDocumentType = 'video';
    } else {
      this.currentDocumentType = this.getFileType(file.name);
    }
    
    this.currentDocumentUrl = url;
    this.currentDocumentName = file.name;
    this.showDocumentViewer = true;
  }

private getCurrentUserName(): string {
    if (typeof localStorage === 'undefined') return 'User';
    
    if (this.currentUserRole === 'student') {
      const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
      return `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim() || 'Student';
    } else if (this.currentUserRole === 'teacher') {
      const teacherProfile = JSON.parse(localStorage.getItem('teacherProfile') || '{}');
      return `${teacherProfile.firstName || ''} ${teacherProfile.lastName || ''}`.trim() || 'Teacher';
    } else {
      const adminProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
      return `${adminProfile.firstName || ''} ${adminProfile.lastName || ''}`.trim() || 'Admin';
    }
  }
}