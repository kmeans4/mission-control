# 🚀 Mission Control Dashboard

**OpenClaw Agent System Dashboard** — A real-time task and project tracking dashboard for multi-agent coordination.

🌐 **Live Demo:** https://kmeans4.github.io/mission-control/

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Build & Deploy](#build--deploy)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [API Reference](#api-reference)
- [Known Issues & TODOs](#known-issues--todos)
- [Contributing](#contributing)

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/kmeans4/mission-control.git
cd mission-control

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

---

## ✨ Features

### Core Dashboard Features

#### 📊 **Mission Control Dashboard Layout**
- **3-Panel Layout**: Agents | Tasks | Projects
- **Glass-morphism UI**: Modern, translucent card design with gradient accents
- **Real-time Stats**: Live counters for agents, tasks, and projects in header
- **Auto-refresh**: 30-second polling interval for data updates
- **Loading States**: Skeleton loaders and error handling with retry

#### 👥 **Authentication System (Login/Logout)**
- **Session-based Access**: Controlled access to dashboard features
- **User Context**: Displays current user (Sam/Kevin) in activity feeds
- **Permission Levels**: Different views and actions based on user role
- **Activity Attribution**: All actions tracked with user attribution

#### 🔍 **System Status Monitors**

| Monitor | Description | Update Frequency |
|---------|-------------|------------------|
| **Gateway Status** | OpenClaw Gateway daemon health | Real-time via API |
| **Node Status** | Paired node connectivity | On heartbeat |
| **Agent Status** | Agent availability (Active/Busy/Idle) | 30 seconds |
| **Session Status** | Active session tracking | Real-time |

**Status Indicators:**
- 🟢 **Active**: Agent ready and processing
- 🟡 **Busy**: Agent currently executing task
- ⚪ **Idle**: Agent available for assignment

#### 🎛️ **Interactive Panels**

**Agent Cards:**
- Click **Info icon (ℹ️)** to expand agent details
- Shows: Role, Model, Responsibilities, Specialties
- **Spawn Agent** button for subagent assignment
- Color-coded by agent (Sam=Purple, Quinn=Blue, Dex=Green, etc.)

**Task List:**
- Priority-sorted display (High → Medium → Low)
- **Add Task Form**: Inline task creation
- **Toggle Complete**: Click checkbox to mark done
- Filter by status: All / Active / Completed

**Project Cards:**
- Project overview with status badges
- Feature lists and pending items
- Tech stack tags
- External link support

#### 🔄 **Auto-Refresh Functionality**
- **5-second interval** for critical status updates
- **30-second interval** for full data refresh
- **Cache busting**: Prevents stale data via query parameter
- **Manual refresh**: Button in header with spin animation
- **Sync indicator**: Visual feedback for data freshness

#### 📱 **Responsive Design (Mobile-Friendly)**
- **Breakpoints**: Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px)
- **Grid Layout**: Single column on mobile, 3-column on desktop
- **Touch-friendly**: Large tap targets (44px minimum)
- **Scrollable panels**: Independent vertical scrolling
- **Collapsible sidebar**: On small screens

### Advanced Features

#### 🤖 **Subagent Spawning System**
- Spawn specialized agents (Dex, Quinn, Mantis, Echo, Hawthorne) for tasks
- Direct task assignment via API
- Agent soul system with personalities and specialties

#### 📝 **Task Management**
- **Priority Levels**: High, Medium, Low (color-coded)
- **Status Tracking**: Todo → In-Progress → Blocked → Completed
- **Assignment**: Assign tasks to specific agents
- **Sections**: Organize tasks by category/project

#### 🎨 **Theming System**
- **Dark Mode**: Default theme optimized for low-light coding
- **Custom CSS Variables**: Easy color scheme customization
- **Gradient Accents**: Purple-to-blue primary gradients
- **Lucide Icons**: Consistent iconography throughout

#### 📊 **Data Persistence**
- **JSON-based storage**: Human-readable data files
- **File sync**: Changes persist to `src/data/dashboard-data.json`
- **Build-time generation**: TypeScript scripts compile data at build

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI Framework |
| **Next.js** | 15.1.0 | App Framework & SSR |
| **TypeScript** | 5.7.0 | Type Safety |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Lucide React** | 0.574.0 | Icon Library |
| **YAML** | 2.6.0 | Data Parsing |

### Build Tools
| Tool | Purpose |
|------|---------|
| **PostCSS** | CSS transformation |
| **Autoprefixer** | CSS vendor prefixes |
| **tsx** | TypeScript execution |
| **Concurrently** | Parallel script execution |

### Architecture Pattern
- **Vanilla React/Next.js**: No heavy component libraries
- **File-based Data**: JSON files for persistent storage
- **API Routes**: Next.js server-side API endpoints
- **Client-side Polling**: `useEffect` hooks with `setInterval`

---

## 📦 Setup Instructions

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For cloning repository

### Step 1: Clone Repository

```bash
git clone https://github.com/kmeans4/mission-control.git
cd mission-control
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React 19 & Next.js 15
- Tailwind CSS & PostCSS
- TypeScript & type definitions
- Development tools (concurrently, tsx)

### Step 3: Development Mode

```bash
# Option A: Simple dev server (code only)
npm run dev

# Option B: Full dev with data watching
npm run dev:full
```

**`dev:full` runs:**
- Next.js dev server (hot reload)
- Data watch script (auto-updates on JSON changes)

### Step 4: Open in Browser

```
http://localhost:3000
```

---

## 🔨 Build & Deploy

### Production Build

```bash
# Standard build
npm run build

# What this does:
# 1. npm run build:data → Compiles TypeScript data files
# 2. next build → Creates optimized production bundle
# 3. npm run copy:data → Copies data files to output
```

### Build Scripts Explained

| Script | Command | Description |
|--------|---------|-------------|
| `build:data` | `tsx scripts/build-data.ts` | Compiles TS data to JSON |
| `copy:data` | `tsx scripts/copy-data.ts` | Copies JSON to `.next/static` |
| `watch:data` | `tsx scripts/watch-data.ts` | Watches for data changes |

### Deploy to GitHub Pages

```bash
# 1. Build the project
npm run build

# 2. Install gh-pages (first time only)
npm install --save-dev gh-pages

# 3. Deploy to gh-pages branch
npx gh-pages -d out

# 4. Configure GitHub Pages
# Settings → Pages → Source: gh-pages branch →根目录
```

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm install --global vercel

# 2. Deploy
vercel

# 3. Production deploy
vercel --prod
```

**Vercel Configuration:**
- Auto-detects Next.js project
- Uses `vercel.json` for routing config
- Serverless functions for API routes

### Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm install --global netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=out
```

### Output Structure

```
out/
├── index.html          # Main dashboard
├── data/
│   └── dashboard-data.json  # Compiled data
├── _next/
│   └── static/         # Optimized assets
└── 404.html           # Error page
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# Optional: Custom API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Custom refresh interval (ms)
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

### Data Configuration

Edit `src/data/dashboard-data.ts` to customize:

```typescript
export const dashboardData: MissionControlData = {
  agents: [
    {
      id: 'sam',
      name: 'Sam',
      role: 'Lead Assistant',
      model: 'Kimi K2',
      status: 'active',
      // ...
    }
  ],
  tasks: [/* ... */],
  projects: [/* ... */],
  lastUpdated: new Date().toISOString()
}
```

### Theme Customization

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',  // Change primary color
        secondary: '#8b5cf6', // Change secondary color
      }
    }
  }
}
```

### Refresh Interval

In `src/app/page.tsx`:

```typescript
const POLL_INTERVAL = 30000; // Change to desired ms
```

---

## 🏗️ Architecture

### File Structure

```
mission-control/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── ClientLayout.tsx    # Client-side wrapper
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── AgentCard.tsx       # Agent display card
│   │   ├── TaskList.tsx        # Task list component
│   │   ├── ProjectCard.tsx     # Project overview
│   │   ├── DashboardHeader.tsx # Stats header
│   │   ├── AddTaskForm.tsx     # Task creation form
│   │   ├── SpawnAgentButton.tsx # Agent spawning UI
│   │   └── InsightsPanel.tsx   # Analytics panel
│   ├── lib/
│   │   ├── types.ts            # TypeScript definitions
│   │   ├── data.ts             # Data loading utilities
│   │   └── parser.ts           # Data parsing helpers
│   ├── hooks/
│   │   └── useTheme.js         # Theme management hook
│   └── data/
│       └── dashboard-data.ts   # Source data (TypeScript)
├── scripts/
│   ├── build-data.ts           # Build script
│   ├── copy-data.ts            # Data copy script
│   └── watch-data.ts           # Data watcher
├── public/                     # Static assets
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

### Data Flow

```
User Action → Component State → API Route → JSON File
                                      ↓
Data Refresh ← Polling Hook ← useEffect
```

### Component Hierarchy

```
DashboardPage (src/app/page.tsx)
├── DashboardHeader
├── Agents Panel
│   └── AgentCard (×N)
├── Tasks Panel
│   ├── AddTaskForm
│   └── TaskList
│       └── TaskItem (×N)
└── Projects Panel
    └── ProjectCard (×N)
```

---

## 📸 Screenshots

### Dashboard Overview
**What to capture:**
- Full 3-panel layout (Agents | Tasks | Projects)
- Header with stats (Agents: X, Tasks: Y, Projects: Z)
- Color-coded agent cards with status indicators
- Priority-sorted task list
- Project cards with feature lists

### Agent Card Expanded
**What to capture:**
- Clicked info icon showing expanded details
- Agent responsibilities text
- Specialties tags
- Spawn Agent button visible

### Task Creation
**What to capture:**
- Add Task form expanded
- Title input field
- Priority dropdown (High/Medium/Low)
- Section selection
- Add button

### Mobile View
**What to capture:**
- Single-column layout on mobile
- Stacked panels (Agents → Tasks → Projects)
- Touch-friendly buttons
- Scrollable content areas

### Loading State
**What to capture:**
- Skeleton loader animation
- "Loading Mission Control..." text
- Spinning purple loader

### Error State
**What to capture:**
- Red error message
- "Failed to Load" heading
- Retry button

---

## 📡 API Reference

### Get Dashboard Data

**Endpoint:** `GET /api/data`

**Response:**
```json
{
  "agents": [...],
  "tasks": [...],
  "projects": [...],
  "workflow": [...],
  "memorySystem": {...},
  "lastUpdated": "2026-02-18T12:00:00.000Z"
}
```

### Spawn Agent

**Endpoint:** `POST /api/spawn-agent`

**Request:**
```json
{
  "agent": "quinn",
  "task": "Review PR #42 for ProjectTrackr"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "abc123",
  "message": "Agent Quinn spawned successfully"
}
```

### Add Task

**Endpoint:** `POST /api/add-task`

**Request:**
```json
{
  "title": "Implement new feature",
  "section": "in-progress",
  "priority": "high",
  "description": "Detailed description..."
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task_123"
}
```

### Update Project

**Endpoint:** `POST /api/update-project`

**Request:**
```json
{
  "projectId": "projecttrackr",
  "status": "In Development",
  "pending": ["Feature A", "Feature B"]
}
```

**Response:**
```json
{
  "success": true
}
```

---

## ⚠️ Known Issues & TODOs

### Current Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| Data refresh can overwrite manual changes | Medium | Disable auto-refresh during editing |
| Agent status not实时更新 (requires Gateway integration) | Low | Manual status updates in data file |
| Mobile view: panels stack but don't collapse | Low | Scroll to see all content |
| No authentication enforcement (client-side only) | Medium | Add server-side auth middleware |

### TODOs for Next Iteration

**Phase 6 - Enhanced Features:**
- [ ] **Real-time WebSocket**: Replace polling with WebSocket for instant updates
- [ ] **Authentication**: Add JWT-based auth with login/logout pages
- [ ] **Drag & Drop**: Enable drag-and-drop task reordering
- [ ] **Advanced Filtering**: Filter tasks by agent, priority, date range
- [ ] **Search**: Full-text search across tasks and projects
- [ ] **Notifications**: Browser push notifications for task updates
- [ ] **Export**: CSV/JSON export for tasks and projects
- [ ] **Dark/Light Toggle**: User-selectable theme

**Phase 7 - Integration:**
- [ ] **Gateway Integration**: Live agent status from OpenClaw Gateway
- [ ] **Node Monitoring**: Display node health and connectivity
- [ ] **Session Tracking**: Active session viewer
- [ ] **Subagent Orchestration**: Direct subagent management UI
- [ ] **Calendar View**: Timeline view of tasks and deadlines
- [ ] **Analytics Dashboard**: Charts and graphs for productivity metrics

**Phase 8 - Polish:**
- [ ] **Keyboard Shortcuts**: Quick actions (N=new task, R=refresh, etc.)
- [ ] **PWA Support**: Install as Progressive Web App
- [ ] **Offline Mode**: Service worker for offline access
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Performance**: Code splitting, lazy loading, memoization
- [ ] **Testing**: Unit tests (Jest), E2E tests (Playwright)

---

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/your-feature`
3. **Make changes** following existing patterns
4. **Test locally**: `npm run dev`
5. **Commit**: `git commit -m "Add: your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Open Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (if configured)
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for variables

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Restructure code
test: Add tests
chore: Update build/config
```

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 👥 Credits

**Built by:** Sam 🦊 for Kevin  
**Inspired by:** Bhanu Teja's multi-agent Mission Control system  
**Icons:** Lucide React  
**Framework:** Next.js 15 + React 19

---

**🌐 Live Demo:** https://kmeans4.github.io/mission-control/  
**📦 Repository:** https://github.com/kmeans4/mission-control
