import { Injectable } from '@angular/core';
import { Message } from '../../interfaces/communication/message';

export interface ChatThread {
  threadId: string;
  participants: string[];
  subject: string;
  messages: Message[];
  lastUpdated: string;
  originalMessageId: string; // ID of the first message from API
  isInitialized: boolean; // Whether first message has been loaded from API
}

@Injectable({
  providedIn: 'root'
})
export class ChatStorageService {
  private readonly STORAGE_KEY = 'message_replies';

  constructor() {}

  // Add reply to a specific message
  addReplyToMessage(originalMessageId: string, reply: Message, userId: string): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const allReplies = this.loadReplies(userId);
    
    if (!allReplies[originalMessageId]) {
      allReplies[originalMessageId] = [];
    }
    
    allReplies[originalMessageId].push(reply);
    localStorage.setItem(key, JSON.stringify(allReplies));
    console.log('Reply saved to localStorage:', { originalMessageId, reply });
  }

  // Get all replies for a specific message
  getThreadReplies(originalMessageId: string, userId: string): Message[] {
    const allReplies = this.loadReplies(userId);
    return allReplies[originalMessageId] || [];
  }

  // Load all replies for current user
  private loadReplies(userId: string): { [messageId: string]: Message[] } {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading replies from storage:', error);
      return {};
    }
  }

  // Clear old replies (older than 30 days)
  clearOldReplies(userId: string): void {
    const allReplies = this.loadReplies(userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    Object.keys(allReplies).forEach(messageId => {
      allReplies[messageId] = allReplies[messageId].filter(reply => 
        new Date(reply.timeStamp || '') > thirtyDaysAgo
      );
      
      if (allReplies[messageId].length === 0) {
        delete allReplies[messageId];
      }
    });
    
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(allReplies));
  }

  // Create or get thread for a message
  createOrGetThread(originalMessageId: string, userId: string): ChatThread {
    const key = `thread_${originalMessageId}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    const newThread: ChatThread = {
      threadId: originalMessageId,
      participants: [],
      subject: '',
      messages: [],
      lastUpdated: new Date().toISOString(),
      originalMessageId: originalMessageId,
      isInitialized: false
    };
    
    localStorage.setItem(key, JSON.stringify(newThread));
    return newThread;
  }

  // Add message to thread
  addMessageToThread(threadId: string, message: Message, userId: string): void {
    const key = `thread_${threadId}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const thread: ChatThread = JSON.parse(stored);
      thread.messages.push(message);
      thread.lastUpdated = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(thread));
    }
  }
}
