# Communication Center Updates

## Overview
Enhanced the communication center with private/broadcast message separation, unread count tracking, and archive functionality - similar to WhatsApp's message organization.

## New Features

### 1. Message Folder Structure
- **Sent Messages**: Messages sent by the user
- **Received Messages**: With 3 subfolders:
  - **All**: Combined view of all received messages
  - **Private**: One-on-one messages (secured by user ID)
  - **Broadcast**: Group announcements
- **Archived**: Archived messages for later reference

### 2. Unread Message Badges
- Red badge showing unread count on:
  - Main "Received" folder
  - Each subfolder (All, Private, Broadcast)
- Real-time updates when messages are read
- Visual indicator (red dot) on unread messages in list

### 3. Archive Functionality
- Archive button on each message (when viewing)
- Moves messages to "Archived" folder
- Removes from active inbox
- Can be accessed anytime from Archived folder

### 4. Security Features
- **Private Messages**: Fetched using user ID only
  - Endpoint: `GET /api/SchoolDashboards/individualMessages/{userId}`
  - Only the authenticated user can access their messages
- **Broadcast Messages**: Filtered by user role
  - Endpoint: `GET /api/SchoolDashboards/broadcastsMessages/{organizationId}/{userRole}`
  - Users only see broadcasts for their role

### 5. Sender Email Fix
- Correctly retrieves logged-in user's email from localStorage
- Checks multiple sources in priority order:
  1. `adminEmail` (set during login)
  2. `adminProfile.email`
  3. `userProfile.email`
  4. `userEmail`
- Role-specific email retrieval for students and teachers

## API Endpoints Used

### Existing Endpoints
- `GET /api/SchoolDashboards/getMessages/{organizationId}/{senderId}` - Sent messages
- `POST /api/SchoolDashboards/message` - Send individual message
- `POST /api/SchoolDashboards/broadcastMessages` - Send broadcast
- `PUT /api/SchoolDashboards/markAsRead/{messageId}` - Mark as read

### New Endpoints Required
- `GET /api/SchoolDashboards/broadcastsMessages/{organizationId}/{userRole}` - Get broadcasts
- `GET /api/SchoolDashboards/individualMessages/{userId}` - Get private messages
- `PUT /api/SchoolDashboards/archiveMessage/{messageId}` - Archive message
- `GET /api/SchoolDashboards/archivedMessages/{userId}` - Get archived messages

## Files Modified

### 1. communication.service.ts
**Added Methods:**
- `getBroadcastMessages(organizationId, userRole)` - Fetch broadcast messages
- `getIndividualMessages(userId)` - Fetch private messages (secured)
- `archiveMessage(messageId)` - Archive a message
- `getArchivedMessages(userId)` - Get archived messages

### 2. communication-center.component.ts
**Added Properties:**
- `broadcastMessages: Message[]` - Broadcast message list
- `privateMessages: Message[]` - Private message list
- `archivedMessages: Message[]` - Archived message list
- `receivedSubFolder: 'all' | 'private' | 'broadcast'` - Subfolder state
- `unreadCount: number` - Total unread count

**Added Methods:**
- `loadAllMessages()` - Load all message types
- `loadBroadcastMessages()` - Load broadcasts
- `loadPrivateMessages()` - Load private messages
- `loadArchivedMessages()` - Load archived
- `loadUnreadCount()` - Subscribe to unread count
- `switchReceivedSubFolder(subFolder)` - Switch between subfolders
- `getSubFolderUnreadCount(subFolder)` - Get unread count per subfolder
- `archiveMessage(message)` - Archive a message

**Updated Methods:**
- `getCurrentMessages()` - Returns messages based on folder/subfolder
- `getUnreadCount()` - Returns unread count for folder
- `switchFolder()` - Now supports 'archived' folder

### 3. communication-center.component.html
**Added UI Elements:**
- Archived folder button in main navigation
- Subfolder navigation (All, Private, Broadcast) under Received
- Unread badges on all folders and subfolders
- Archive button on message view
- Dynamic header showing current folder/subfolder

### 4. communication-center.component.css
**Added Styles:**
- `.subfolder-navigation` - Subfolder button container
- `.subfolder-btn` - Individual subfolder button
- `.unread-badge` - Unread count badge
- `.message-actions` - Action buttons container
- `.action-btn` - Generic action button
- `.archive-btn` - Archive button with hover effect

### 5. message.ts (Interface)
**Added Properties:**
- `isArchived?: boolean` - Archive status
- `createdAt?: string` - Creation timestamp

## User Experience Flow

### Viewing Messages
1. User opens Communication Center
2. Defaults to "Received" folder with "All" subfolder
3. Unread badges show on folders with new messages
4. Click subfolder to filter: Private or Broadcast
5. Click message to read (marks as read, updates badge)

### Archiving Messages
1. Open any received message
2. Click "🗄️ Archive" button
3. Message moves to Archived folder
4. Removed from active inbox
5. Access anytime from Archived folder

### Security
- Private messages use user ID authentication
- No cross-user message access
- Broadcast messages filtered by role
- Sender email always matches logged-in user

## Testing Checklist

- [ ] Sent messages display correctly
- [ ] Private messages load for authenticated user only
- [ ] Broadcast messages filter by user role
- [ ] Unread badges update when reading messages
- [ ] Archive button moves message to Archived folder
- [ ] Subfolder navigation works (All, Private, Broadcast)
- [ ] Sender email matches logged-in user
- [ ] Refresh button reloads all message types
- [ ] Empty states show when no messages
- [ ] Responsive design works on mobile

## Notes for Backend Team

### Archive Endpoint
The archive endpoint should:
- Set `isArchived = true` on the message
- Keep message in database (don't delete)
- Return success/error status

### Individual Messages Endpoint
Should return messages where:
- `recipientId = userId` (authenticated user)
- `isArchived = false`
- Ordered by `createdAt DESC`

### Broadcast Messages Endpoint
Should return messages where:
- `recipientRole = userRole` OR `recipientRole = null` (all roles)
- `organizationId = organizationId`
- `isArchived = false`
- Ordered by `createdAt DESC`

## Future Enhancements
- [ ] Message search functionality
- [ ] Filter by date range
- [ ] Bulk archive/delete
- [ ] Message attachments
- [ ] Read receipts for sent messages
- [ ] Push notifications for new messages
- [ ] Message threading/replies
