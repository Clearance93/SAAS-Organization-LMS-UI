import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;

  constructor(private http: HttpClient) {
    this.addMessage('Hello! I\'m your AI assistant. How can I help you today?', false);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
    }
  }

  minimizeChat(): void {
    this.isMinimized = !this.isMinimized;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput.trim();
    this.addMessage(userMessage, true);
    this.userInput = '';
    this.isLoading = true;

    setTimeout(() => {
      const response = this.generateResponse(userMessage);
      this.addMessage(response, false);
      this.isLoading = false;
    }, 1000);
  }

  private addMessage(text: string, isUser: boolean): void {
    this.messages.push({
      text,
      isUser,
      timestamp: new Date()
    });
  }

  private generateResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('schedule') || lowerQuery.includes('class')) {
      return 'To schedule a class or workshop, navigate to the Quick Actions section and click on "Schedule Workshop" or use the calendar feature in your dashboard.';
    } else if (lowerQuery.includes('student') || lowerQuery.includes('add')) {
      return 'To add a new student, go to Quick Actions and select "Add Student". Fill in the required information including name, email, and grade level.';
    } else if (lowerQuery.includes('message') || lowerQuery.includes('communication')) {
      return 'You can access the Communication Center by clicking the bell icon in the header or selecting "Messages" from Quick Actions.';
    } else if (lowerQuery.includes('report') || lowerQuery.includes('analytics')) {
      return 'To generate reports, click on "Generate Report" in Quick Actions. You can view student performance, attendance, and other analytics.';
    } else if (lowerQuery.includes('help') || lowerQuery.includes('how')) {
      return 'I can help you with scheduling, adding users, sending messages, generating reports, and navigating the platform. What would you like to know?';
    } else {
      return 'I\'m here to help! Ask me about scheduling, adding users, messages, reports, or navigation.';
    }
  }

  clearChat(): void {
    this.messages = [];
    this.addMessage('Chat cleared. How can I help you?', false);
  }
}
