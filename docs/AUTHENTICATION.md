# Authentication System Documentation

## Overview

The Mission Control Dashboard implements a session-based authentication system that provides controlled access to dashboard features while tracking user activity across the multi-agent system.

---

## Architecture

### Authentication Model

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Login    │────▶│  Session Token   │────▶│  Dashboard Access│
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │                       │                        │
       ▼                       ▼                        ▼
  Credentials            JWT/Session            Feature Permissions
  Validation               Storage                & Activity Log
```

### Current Implementation

**Phase 5 (Current):**
- Client-side session tracking
- User context in activity feeds
- Permission-based UI rendering

**Phase 6 (Planned):**
- Server-side JWT authentication
- Login/Logout pages
- Protected API routes
- Token refresh mechanism

---

## Features

### 1. Session-Based Access

**User Context:**
- Displays current user (Sam/Kevin) in dashboard
- Activity attribution for all actions
- Role-based feature visibility

**Implementation:**
```typescript
// User context stored in component state
const [currentUser, setCurrentUser] = useState<User>({
  id: 'sam',
  name: 'Sam',
  role: 'Lead Assistant',
  permissions: ['read', 'write', 'spawn_agent']
});
```

### 2. Login/Logout Flow

**Current (Client-side):**
```
1. User opens dashboard
2. Session initialized from localStorage
3. User context available immediately
4. Logout clears session data
```

**Planned (Server-side JWT):**
```
1. User enters credentials on /login
2. POST /api/auth/login with credentials
3. Server validates & returns JWT token
4. Token stored in httpOnly cookie
5. Subsequent requests include token
6. Logout invalidates token server-side
```

### 3. User Activity Tracking

All dashboard actions are attributed to the current user:

| Action | Tracked Data |
|--------|--------------|
| Create Task | User ID, Timestamp, Task Details |
| Update Task | User ID, Old Status, New Status |
| Spawn Agent | User ID, Agent ID, Task Description |
| Update Project | User ID, Project ID, Changes |

**Example Activity Log:**
```json
{
  "activities": [
    {
      "agent": "Sam",
      "action": "created task",
      "target": "Implement authentication",
      "time": "Just now",
      "userId": "sam",
      "timestamp": "2026-02-18T15:30:00.000Z"
    }
  ]
}
```

---

## Components

### UserProfile Component

Displays current user information in the dashboard header.

```tsx
interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="user-profile">
      <span className="user-name">{user.name}</span>
      <span className="user-role">{user.role}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
```

### ProtectedRoute Component

Wraps pages that require authentication.

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

---

## API Endpoints

### Planned Authentication APIs

#### POST /api/auth/login

**Request:**
```json
{
  "username": "sam",
  "password": "••••••••"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "sam",
    "name": "Sam",
    "role": "Lead Assistant"
  },
  "expiresIn": 3600
}
```

#### POST /api/auth/logout

**Request:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh

**Request:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### GET /api/auth/me

Get current user info.

**Response:**
```json
{
  "user": {
    "id": "sam",
    "name": "Sam",
    "role": "Lead Assistant",
    "permissions": ["read", "write", "spawn_agent"]
  }
}
```

---

## Permission Levels

### Role-Based Access Control

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **Admin** (Kevin) | All permissions | Full dashboard + settings |
| **Lead Assistant** (Sam) | read, write, spawn_agent | Full dashboard |
| **Agent** (Dex/Quinn) | read, execute assigned tasks | Task view only |
| **Viewer** | read | Dashboard view only |

### Permission Matrix

| Feature | Admin | Lead | Agent | Viewer |
|---------|-------|------|-------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Task | ✅ | ✅ | ❌ | ❌ |
| Update Task | ✅ | ✅ | ⚠️* | ❌ |
| Delete Task | ✅ | ✅ | ❌ | ❌ |
| Spawn Agent | ✅ | ✅ | ❌ | ❌ |
| Update Project | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

*Agents can only update tasks assigned to them

---

## Security Considerations

### Current Limitations

⚠️ **Phase 5 (Current):**
- Client-side only authentication
- No password protection
- Session can be spoofed
- Suitable for local/trusted network use only

### Phase 6 Security Improvements

**Token Security:**
- JWT with HMAC-SHA256 signing
- Short expiration (1 hour)
- Refresh token mechanism
- Token stored in httpOnly cookies (XSS protection)

**Password Security:**
- bcrypt hashing (12 rounds)
- Minimum 8 characters
- Rate limiting on login attempts
- Account lockout after 5 failed attempts

**API Security:**
- CORS configuration
- CSRF token validation
- Rate limiting per IP
- Input sanitization

---

## Implementation Guide

### Adding Authentication to New Components

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  if (!hasPermission('write')) {
    return <AccessDenied />;
  }
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Hook: useAuth

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and fetch user
      fetchUser(token).then(setUser);
    }
    setLoading(false);
  }, []);
  
  const login = async (credentials: Credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const { token, user } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
  };
  
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };
  
  const hasPermission = (permission: Permission) => {
    return user?.permissions.includes(permission) ?? false;
  };
  
  return { user, loading, login, logout, hasPermission };
}
```

---

## Activity Logging

### Log Structure

```typescript
interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType: 'task' | 'project' | 'agent' | 'session';
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}
```

### Example Logs

**Task Created:**
```json
{
  "id": "log_123",
  "userId": "sam",
  "action": "create",
  "resourceType": "task",
  "resourceId": "task_456",
  "details": {
    "title": "Implement login page",
    "priority": "high"
  },
  "timestamp": "2026-02-18T15:30:00.000Z"
}
```

**Agent Spawned:**
```json
{
  "id": "log_124",
  "userId": "sam",
  "action": "spawn",
  "resourceType": "agent",
  "resourceId": "quinn",
  "details": {
    "task": "Review PR #42"
  },
  "timestamp": "2026-02-18T15:35:00.000Z"
}
```

---

## Testing

### Unit Tests

```typescript
describe('Authentication', () => {
  test('login with valid credentials returns token', async () => {
    const response = await login({ username: 'sam', password: 'password123' });
    expect(response.success).toBe(true);
    expect(response.token).toBeDefined();
  });
  
  test('login with invalid credentials rejects', async () => {
    const response = await login({ username: 'sam', password: 'wrong' });
    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid credentials');
  });
  
  test('protected route redirects unauthenticated users', () => {
    render(<ProtectedRoute><Dashboard /></ProtectedRoute>, {
      authContext: { isAuthenticated: false }
    });
    expect(window.location.pathname).toBe('/login');
  });
});
```

### E2E Tests

```typescript
describe('Authentication Flow', () => {
  test('complete login/logout flow', async () => {
    await page.goto('/login');
    await page.fill('[name=username]', 'sam');
    await page.fill('[name=password]', 'password123');
    await page.click('[type=submit]');
    
    await expect(page.locator('.user-profile')).toContainText('Sam');
    
    await page.click('[data-testid=logout]');
    await expect(page).toHaveURL('/login');
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue: Session expires unexpectedly**
- **Cause:** Token expiration too short
- **Fix:** Increase `expiresIn` in JWT config or implement refresh tokens

**Issue: User can access unauthorized features**
- **Cause:** Missing permission check in component
- **Fix:** Add `hasPermission()` check before rendering

**Issue: Logout doesn't clear session**
- **Cause:** Token also stored in cookie
- **Fix:** Clear both localStorage and cookies on logout

---

## Future Enhancements

### Phase 6 Roadmap

- [ ] OAuth2 integration (GitHub, Google)
- [ ] Two-factor authentication (2FA)
- [ ] Session management dashboard
- [ ] Login attempt monitoring
- [ ] Password reset flow
- [ ] Email verification
- [ ] Account recovery codes

### Phase 7 Integrations

- [ ] OpenClaw Gateway SSO
- [ ] Team member invitations
- [ ] Role management UI
- [ ] Audit log viewer
- [ ] Session timeout warnings

---

**Last Updated:** February 18, 2026  
**Version:** 1.0.0 (Phase 5)
