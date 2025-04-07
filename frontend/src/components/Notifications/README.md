# Notification System

This directory contains components for the Verzot notification system. The notification system enables real-time user notifications throughout the application.

## Components

### NotificationBadge

The `NotificationBadge` component displays the count of unread notifications in the application header. It provides a visual indicator of new notifications and links to the notifications page.

**Features:**
- Displays unread notification count
- Links to notifications page
- Automatically refreshes count every 30 seconds
- Badge styling varies based on notification count

**Usage:**
```jsx
import NotificationBadge from '../components/Notifications/NotificationBadge';

// Inside a component:
<NotificationBadge />
```

## Related Components (elsewhere in codebase)

### Toast Notifications

The `Toast` and `ToastContainer` components (in `src/components/UI`) display temporary notification alerts when new notifications arrive. They provide immediate feedback for important events.

**Features:**
- Multiple toast types: info, success, warning, error
- Auto-dismiss functionality (configurable duration)
- Support for rich content like match scores
- Animated entrance and exit

**Usage:**
```jsx
import { useToast } from '../context/ToastContext';

// Inside a component:
const toast = useToast();

// Display a toast
toast.info('Your message here');
toast.success('Operation successful', { title: 'Success', duration: 3000 });
toast.warning('Warning message');
toast.error('Error message', { duration: 0 }); // Won't auto-dismiss
```

### Notifications Page

The `Notifications` page component (in `src/pages/Notifications`) provides a comprehensive interface for viewing and managing all notifications.

**Features:**
- List all notifications with filtering options
- Mark notifications as read individually or in bulk
- Delete notifications individually or in bulk
- Filter by notification type and read status
- Pagination support
- Different styling for unread and priority notifications

## Context Providers

### NotificationContext

The `NotificationContext` (`src/context/NotificationContext.js`) provides global state and methods for managing notifications throughout the application.

**Features:**
- Fetch notifications with filtering and pagination
- Mark notifications as read
- Delete notifications
- Track unread notification count
- Socket.io integration for real-time updates

**Usage:**
```jsx
import { useNotifications } from '../context/NotificationContext';

// Inside a component:
const { 
  notifications, 
  unreadCount, 
  fetchNotifications,
  markAsRead,
  deleteNotifications 
} = useNotifications();
```

### ToastContext

The `ToastContext` (`src/context/ToastContext.js`) provides methods for displaying toast notifications throughout the application.

**Features:**
- Display different types of toast notifications
- Auto-dismiss functionality
- Support for titles and extra content
- Queue management for multiple toasts

**Usage:**
```jsx
import { useToast } from '../context/ToastContext';

// Inside a component:
const toast = useToast();

// Display different types of toasts
toast.info('Info message');
toast.success('Success message');
toast.warning('Warning message');
toast.error('Error message');

// With options
toast.info('Message with options', {
  title: 'Optional Title',
  duration: 8000, // 8 seconds
  extraContent: 'Additional content'
});
```

## API Integration

The notification system integrates with the backend API via `notificationService` (`src/services/notificationService.js`), which provides methods for:

- Fetching user notifications
- Getting unread notification count
- Marking notifications as read
- Deleting notifications
- Creating notifications (admin only)

## Real-time Updates

The notification system uses Socket.io for real-time updates:

1. The `NotificationContext` establishes a Socket.io connection
2. When authenticated, it joins a user-specific notification channel
3. The backend emits 'new-notification' events when new notifications occur
4. Frontend listens for these events and updates the UI accordingly
5. New notifications trigger toast alerts based on notification priority

## Notification Types

The system supports various notification types, including:

- `match_goal`: Goal scored in a match
- `match_red_card`: Red card issued in a match
- `match_result`: Final match result
- `match_confirmation`: Match result confirmation
- `tournament_status`: Tournament status changes
- `team_invitation`: Invitations to join teams
- `admin_announcement`: System-wide announcements

Each type has specialized display formatting and can include additional metadata for rich context.

## Notification Priorities

Notifications support three priority levels:

- `normal`: Standard notifications (blue styling)
- `high`: Important notifications (orange styling)
- `urgent`: Critical notifications (red styling)

Priority affects both the visual treatment in the notifications list and the toast notification type. 