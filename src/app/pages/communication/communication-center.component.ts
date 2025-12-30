import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunicationService } from '../../services/communication/communication.service';
import { AdminDashboardService } from '../../services/schoolDashboards/admin-dashboard.service';
import { UserService, User } from '../../services/communication/user.service';
import { Message, CreateMessageDto, BroadcastMessageDto } from '../../interfaces/communication/message';

@Component({
  selector: 'app-communication-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communication-center.component.html',
  styleUrls: ['./communication-center.component.css']
})
export class CommunicationCenterComponent implements OnInit {
  messages: Message[] = [];
  selectedMessage: Message | null = null;
  isComposing = false;
  
  // Compose form
  newMessage = {
    recipientRole: 'student',
    recipientId: '',
    subject: '',
    content: '',
    isBroadcast: false
  };
  
  availableUsers: User[] = [];
  isLoadingUsers = false;

  constructor(
    private communicationService: CommunicationService,
    private adminService: AdminDashboardService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMessages();
    this.onRoleChange(); // Load users for default role (student)
  }

  loadMessages() {
    const orgId = this.adminService.getOrganizationId();
    if (orgId) {
      this.communicationService.getMessages(orgId).subscribe({
        next: (messages) => {
          this.messages = messages;
        },
        error: (error) => {
          console.error('Error loading messages:', error);
        }
      });
    }
  }

  selectMessage(message: Message) {
    this.selectedMessage = message;
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }

  markAsRead(messageId: string) {
    this.communicationService.markAsRead(messageId).subscribe({
      next: () => {
        console.log('Message marked as read');
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
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
    const orgId = this.adminService.getOrganizationId();
    if (!orgId) return;

    if (this.newMessage.isBroadcast) {
      this.sendBroadcastMessage(orgId);
    } else {
      this.sendIndividualMessage(orgId);
    }
  }

  private sendIndividualMessage(orgId: string) {
    const selectedUser = this.availableUsers.find(user => user.id === this.newMessage.recipientId);
    const currentAdmin = this.adminService.getCurrentAdmin();
    const dashboardStats = this.adminService.getCurrentDahsboardStats();
    
    console.log('Current admin:', currentAdmin);
    console.log('Dashboard stats:', dashboardStats);
    
    // Try multiple ways to get the admin email
    let adminEmail = currentAdmin?.adminBusinessEmail || dashboardStats?.adminBusinessEmail;
    
    // If no email found, try to get from localStorage or make API call
    if (!adminEmail) {
      const storedAdmin = localStorage.getItem('adminProfile');
      if (storedAdmin) {
        const adminData = JSON.parse(storedAdmin);
        adminEmail = adminData.adminBusinessEmail;
        console.log('Admin email from localStorage:', adminEmail);
      }
    }
    
    console.log('Final admin email:', adminEmail);
    
    const messageData: CreateMessageDto = {
      createMessageId: crypto.randomUUID(),
      senderEmail: adminEmail || 'unknown-admin-email',
      organizationId: orgId,
      recipientId: this.newMessage.recipientId,
      recipientRole: this.newMessage.recipientRole,
      subject: this.newMessage.subject,
      content: this.newMessage.content,
      createdAt: new Date().toISOString()
    };

    this.communicationService.sendMessage(messageData).subscribe({
      next: (message) => {
        console.log('Message sent successfully');
        this.cancelCompose();
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  private sendBroadcastMessage(orgId: string) {
    const currentAdmin = this.adminService.getCurrentAdmin();
    const dashboardStats = this.adminService.getCurrentDahsboardStats();
    
    const broadcastData: BroadcastMessageDto = {
      broadcastId: crypto.randomUUID(),
      senderEmail: currentAdmin?.adminBusinessEmail || dashboardStats?.adminBusinessEmail || 'unknown-admin-email',
      role: this.newMessage.recipientRole,
      subject: this.newMessage.subject,
      organizationId: orgId,
      createdAt: new Date().toISOString()
    };

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

  onBroadcastToggle() {
    if (this.newMessage.isBroadcast) {
      this.newMessage.recipientId = '';
    }
  }

  onRoleChange() {
    const orgId = this.adminService.getOrganizationId();
    if (!orgId) return;
    
    this.isLoadingUsers = true;
    this.userService.getUsersByRole(orgId, this.newMessage.recipientRole).subscribe({
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
    const orgId = this.adminService.getOrganizationId();
    if (!orgId) return;
    
    this.isLoadingUsers = true;
    this.userService.getAllUsers(orgId).subscribe({
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



  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }

  backToDashboard(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }
}