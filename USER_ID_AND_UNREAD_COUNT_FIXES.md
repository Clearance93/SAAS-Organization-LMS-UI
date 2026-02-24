# User ID and Unread Message Count Fixes

## Overview
Fixed user ID retrieval issues and implemented unread message count badges across all dashboards (Student, Teacher, Admin).

## Issues Fixed

### 1. Student Dashboard - Correct User ID
**Problem**: Student dashboard was potentially using wrong ID (adminId instead of studentId)

**Solution**: 
- Student dashboard already correctly retrieves `studentId` from `studentProfile` in localStorage
- Added verification in `ngOnInit()` to ensure proper ID is used
- Path: `studentProfile.studentId` from localStorage

### 2. Unread Message Count - All Dashboards
**Problem**: 
- Teacher dashboard had no unread message count
- Student dashboard had hardcoded message count
- Admin dashboard showed sent messages count instead of received messages

**Solution**: Implemented real-time unread message count for all dashboards

## Implementation Details

### Student Dashboard
**File**: `student-dashboard.component.ts`

**Changes**:
1. Added `CommunicationService` import and injection
2. Added `loadUnreadMessageCount()` method:
   - Fetches individual messages for student using `studentId`
   - Fetches broadcast messages for 'student' role
   - Combines unread counts from both sources
3. Called in `ngOnInit()` after loading dashboard data

**Code**:
```typescript
loadUnreadMessageCount(): void {
  this.communicationService.getIndividualMessages(this.studentId).subscribe({
    next: (messages) => {
      this.messagesCount = messages.filter(m => !m.isRead).length;
    }
  });
  
  this.communicationService.getBroadcastMessages(this.organizationId, 'student').subscribe({
    next: (broadcasts) => {
      const unreadBroadcasts = broadcasts.filter(m => !m.isRead).length;
      this.messagesCount += unreadBroadcasts;
    }
  });
}
```

### Teacher Dashboard
**File**: `teacher-dashboard.component.ts`

**Changes**:
1. Added `CommunicationService` import and injection
2. Added `unreadMessagesCount` property
3. Added `loadUnreadMessageCount()` method:
   - Fetches individual messages for teacher using `teacherId`
   - Fetches broadcast messages for 'teacher' role
   - Combines unread counts from both sources
4. Called in `applyTeacherDashboard()` after loading dashboard stats

**Code**:
```typescript
private loadUnreadMessageCount(orgId: string, teacherId: string): void {
  this.communicationService.getIndividualMessages(teacherId).subscribe({
    next: (messages) => {
      this.unreadMessagesCount = messages.filter(m => !m.isRead).length;
    }
  });
  
  this.communicationService.getBroadcastMessages(orgId, 'teacher').subscribe({
    next: (broadcasts) => {
      const unreadBroadcasts = broadcasts.filter(m => !m.isRead).length;
      this.unreadMessagesCount += unreadBroadcasts;
    }
  });
}
```

### Admin Dashboard
**File**: `school-admin-dashboard.component.ts`

**Changes**:
1. Updated `loadNotifications()` method to load RECEIVED messages instead of sent
2. Fetches individual messages for admin using `adminId`
3. Fetches broadcast messages for 'admin' role
4. Combines unread counts from both sources

**Code**:
```typescript
private loadNotifications(): void {
  if (this.organizationId && this.adminId) {
    // Load individual messages received by admin
    this.communicationService.getIndividualMessages(this.adminId).subscribe({
      next: (messages) => {
        this.unreadMessageCount = messages.filter(m => !m.isRead).length;
      }
    });
    
    // Load broadcast messages for admin role
    this.communicationService.getBroadcastMessages(this.organizationId, 'admin').subscribe({
      next: (broadcasts) => {
        const unreadBroadcasts = broadcasts.filter(m => !m.isRead).length;
        this.unreadMessageCount += unreadBroadcasts;
      }
    });
  }
}
```

## API Endpoints Used

### Individual Messages (Private)
- **Endpoint**: `GET /api/SchoolDashboards/individualMessages/{userId}`
- **Security**: User-specific - only returns messages for authenticated user
- **Returns**: Array of messages where `recipientId = userId`

### Broadcast Messages (By Role)
- **Endpoint**: `GET /api/SchoolDashboards/broadcastsMessages/{organizationId}/{userRole}`
- **Security**: Role-based filtering
- **Returns**: Array of broadcast messages for specific role

## User ID Sources by Role

### Student
- **Primary**: `localStorage.getItem('studentProfile')` → `studentProfile.studentId`
- **Fallback**: `localStorage.getItem('userId')`

### Teacher
- **Primary**: `localStorage.getItem('roleUserId')` or `localStorage.getItem('teacherId')`
- **Fallback**: `localStorage.getItem('userId')`
- **Set during**: Login process via JWT token claims

### Admin
- **Primary**: `dashboardStats.adminId` or `localStorage.getItem('adminId')`
- **Fallback**: `localStorage.getItem('userId')`
- **Set during**: Dashboard data load from API

## Security Features

1. **User-Specific Messages**: Individual messages endpoint uses user ID - no cross-user access
2. **Role-Based Broadcasts**: Broadcast messages filtered by user role
3. **Unread Count**: Only counts messages where `isRead = false`
4. **Real-time Updates**: Counts update when dashboard loads

## Testing Checklist

- [ ] Student dashboard shows correct unread count
- [ ] Teacher dashboard shows unread message badge
- [ ] Admin dashboard shows received (not sent) message count
- [ ] Unread count includes both private and broadcast messages
- [ ] Count updates when messages are read
- [ ] No cross-user message access
- [ ] Correct user ID used for each role

## UI Display

All dashboards display unread count as:
- **Badge**: Red circular badge with number
- **Location**: Next to mail/message icon in header
- **Visibility**: Only shown when count > 0
- **Updates**: Real-time when dashboard loads

## Notes

- Unread count combines private messages + broadcast messages
- Each dashboard uses role-appropriate user ID
- Security enforced at API level (user ID validation)
- No caching - always fetches fresh count on dashboard load
