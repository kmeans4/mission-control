# Dashboard Layout Documentation

## Overview

The Mission Control Dashboard features a modern, responsive 3-panel layout designed for efficient multi-agent coordination and task management.

---

## Layout Structure

### Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER (65px)                            │
│  Logo | Stats (Agents, Tasks, Projects) | Last Updated | 🔃    │
├──────────┬──────────────────────────────┬──────────────────────┤
│          │                              │                      │
│  AGENTS  │           TASKS              │     PROJECTS         │
│  Panel   │           Panel              │     Panel            │
│  (280px) │        (flex-1)              │    (flex-1)          │
│          │                              │                      │
│  • Sam   │  • Add Task Form             │  • CashedBets        │
│  • Dex   │  • Task List                 │  • ProjectTrackr     │
│  • Quinn │    - High Priority           │  • General           │
│          │    - Medium Priority         │                      │
│          │    - Low Priority            │                      │
│          │                              │                      │
│          │                              │                      │
│          │                              │                      │
│          │                              │                      │
│          │                              │                      │
└──────────┴──────────────────────────────┴──────────────────────┘
```

### Mobile Layout (< 640px)

```
┌───────────────────────────────┐
│          HEADER               │
│  Logo | Stats | 🔃            │
├───────────────────────────────┤
│                               │
│         AGENTS PANEL          │
│         (Full Width)          │
│                               │
├───────────────────────────────┤
│                               │
│          TASKS PANEL          │
│         (Full Width)          │
│                               │
├───────────────────────────────┤
│                               │
│        PROJECTS PANEL         │
│         (Full Width)          │
│                               │
└───────────────────────────────┘
```

---

## Header Component

### Anatomy

```tsx
<DashboardHeader>
  ├── Logo Section
  │   ├── Icon (Activity)
  │   ├── Title: "Mission Control"
  │   └── Subtitle: "OpenClaw Agent System Dashboard"
  │
  ├── Stats Section
  │   ├── Agents Count (with Users icon)
  │   ├── Tasks Count (with CheckSquare icon)
  │   └── Projects Count (with FolderOpen icon)
  │
  ├── Metadata Section
  │   ├── Last Updated Timestamp
  │   └── Manual Refresh Button
  │
  └── User Profile (Planned)
      ├── Avatar
      ├── Username
      └── Logout Button
</DashboardHeader>
```

### Props

```typescript
interface DashboardHeaderProps {
  agentCount: number;      // Number of active agents
  taskCount: number;       // Total tasks
  projectCount: number;    // Total projects
  lastUpdated?: string;    // ISO timestamp
  onRefresh?: () => void;  // Refresh callback
  isRefreshing?: boolean;  // Loading state
}
```

### CSS Classes

```css
.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}
```

---

## Sidebar: Agents Panel

### Width & Positioning

- **Desktop:** Fixed 280px width, left side
- **Mobile:** 100% width, top position
- **Background:** `var(--bg-secondary)`
- **Border:** Right border only (desktop)

### Sections

#### 1. Agents & Projects

```tsx
<div className="sidebar-section">
  <div className="sidebar-title">Agents & Projects</div>
  
  {/* Filter Cards */}
  <div className="agent-list">
    <AgentCard agent="sam" filter="all" />
    <AgentCard agent="cashedbets" filter="cashedbets" />
    <AgentCard agent="projecttrackr" filter="projecttrackr" />
  </div>
</div>
```

**Agent Card Structure:**
```
┌────────────────────────────┐
│  🦊  Sam (You)             │
│      Squad Lead            │
│  🟢 Active                 │
├────────────────────────────┤
│  🏈  CashedBets            │
│      iOS App Project       │
│  🟡 In Progress            │
├────────────────────────────┤
│  📊  ProjectTrackr         │
│      Contractor PM Tool    │
│  🟡 In Progress            │
└────────────────────────────┘
```

#### 2. Activity Feed

**Last 10 activities displayed**

```tsx
<div className="sidebar-section">
  <div className="sidebar-title">Recent Activity</div>
  <div className="activity-list">
    {activities.map(activity => (
      <ActivityItem key={activity.id} activity={activity} />
    ))}
  </div>
</div>
```

**Activity Item:**
```
┌────────────────────────────┐
│  S  Sam created task       │
│     "Set up dashboard"     │
│     Just now               │
├────────────────────────────┤
│  S  Sam completed          │
│     "Research Buildern"    │
│     2 hours ago            │
└────────────────────────────┘
```

### CSS Grid Setup

```css
.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 1.5rem;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
```

---

## Main Content Area

### Layout Grid

```css
.content {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .content {
    grid-template-columns: 1fr;
  }
}
```

### Stats Row

**4-column grid displaying quick stats**

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Inbox     │ In Progress │   Review    │    Done     │
│      5      │      3      │      2      │      8      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Implementation:**
```tsx
<div className="stats-row">
  <StatCard
    label="Inbox"
    value={stats.inbox}
    className="inbox"
    color="var(--text-muted)"
  />
  <StatCard
    label="In Progress"
    value={stats.in_progress}
    className="progress"
    color="var(--accent-info)"
  />
  <StatCard
    label="Review"
    value={stats.review}
    className="review"
    color="var(--accent-warning)"
  />
  <StatCard
    label="Done"
    value={stats.done}
    className="done"
    color="var(--accent-success)"
  />
</div>
```

### Kanban Board

**5-column task board**

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  📥     │   👤     │   ⚡     │   👀     │   ✅     │
│  Inbox   │ Assigned │ In Prog  │  Review  │   Done   │
│    [3]   │    [2]   │    [5]   │    [1]   │    [8]   │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│  Task 1  │  Task 4  │  Task 7  │  Task 11 │  Task 12 │
│  Task 2  │  Task 5  │  Task 8  │          │  Task 13 │
│  Task 3  │          │  Task 9  │          │  Task 14 │
│          │          │  Task 10 │          │  ...     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Column Component:**
```tsx
<div className="board-column" data-status="inbox">
  <div className="column-header">
    <span className="column-title">📥 Inbox</span>
    <span className="column-count" id="countInbox">3</span>
  </div>
  <div className="task-list" id="listInbox">
    {/* Task cards rendered here */}
  </div>
</div>
```

**Drag & Drop:**
- Enabled on all task cards
- Visual feedback on drag-over
- Updates task status on drop

---

## Task Panel (Middle Column)

### Content Structure

```tsx
<div className="lg:col-span-1">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <CheckSquare className="w-5 h-5 text-amber-400" />
      <h2 className="text-lg font-semibold text-white">Tasks</h2>
    </div>
    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
      {tasks.length}
    </span>
  </div>
  
  {/* Add Task Form */}
  <AddTaskForm onAdd={handleAddTask} />
  
  {/* Task List */}
  <div className="max-h-[500px] overflow-y-auto pr-2">
    <TaskList tasks={sortedTasks} onToggle={handleToggle} />
  </div>
</div>
```

### Task List Features

- **Priority Sorting:** High → Medium → Low
- **Scrollable:** Max height 500px with vertical scroll
- **Interactive:** Click to toggle complete
- **Empty State:** Message when no tasks

---

## Projects Panel (Right Column)

### Content Structure

```tsx
<div className="lg:col-span-1">
  {/* Header */}
  <div className="flex items-center gap-2 mb-4">
    <FolderOpen className="w-5 h-5 text-green-400" />
    <h2 className="text-lg font-semibold text-white">Projects</h2>
  </div>
  
  {/* Project Cards */}
  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
    {projects.map(project => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </div>
</div>
```

### Project Card Layout

```
┌────────────────────────────────────┐
│  📊  ProjectTrackr                 │
│      Contractor PM Tool            │
│  🟡 In Development                 │
│                                    │
│  Features:                         │
│  • Bid Management                  │
│  • Task Tracking                   │
│  • Client Portal                   │
│                                    │
│  Tech Stack:                       │
│  [React] [Next.js] [Supabase]     │
│                                    │
│  Pending:                          │
│  • Phase 2: Manage the Work        │
│  • Phase 3: Financial Tools        │
└────────────────────────────────────┘
```

---

## Responsive Breakpoints

### CSS Media Queries

```css
/* Mobile First Base */
.main-container {
  display: flex;
  flex-direction: column;
  height: auto;
}

/* Tablet (640px+) */
@media (min-width: 640px) {
  .main-container {
    flex-direction: row;
    height: calc(100vh - 65px);
  }
  
  .sidebar {
    width: 240px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
  }
  
  .content {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .stats-row {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .board-container {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

### Component Behavior by Breakpoint

| Component | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|-----------|-----------------|---------------------|-------------------|
| **Header** | Stacked layout | Horizontal | Horizontal |
| **Sidebar** | Top, 100% width | Left, 240px | Left, 280px |
| **Stats Row** | 2 columns | 4 columns | 4 columns |
| **Kanban Board** | Hidden (use list view) | 3 columns | 5 columns |
| **Task List** | Full width | Full width | Middle column |
| **Projects** | Full width | Full width | Right column |
| **Activity Feed** | 5 items | 8 items | 10 items |

---

## Layout Utility Classes

### Flexbox Grid

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
```

### Grid Layouts

```css
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
```

---

## Accessibility

### Landmark Regions

```html
<header role="banner">...</header>
<aside role="complementary">...</aside>
<main role="main">...</main>
```

### Focus Management

- **Tab Order:** Header → Sidebar → Content
- **Focus Indicators:** 2px outline on focused elements
- **Skip Links:** "Skip to main content" link

### ARIA Labels

```tsx
<header aria-label="Dashboard Header">
  <aside aria-label="Navigation Sidebar">
    <main aria-label="Dashboard Content">
      <nav aria-label="Task Board">
```

---

## Performance Optimizations

### Virtual Scrolling

For large task/project lists (> 50 items):
- Implement virtual scrolling with `react-window`
- Only render visible items (± 5 buffer)
- Maintain scroll position on updates

### Lazy Loading

- Components below fold loaded on scroll
- Images/icons lazy-loaded
- API data cached with stale-while-revalidate

### CSS Containment

```css
.task-list {
  contain: layout style;
  overflow-y: auto;
  max-height: 500px;
}
```

---

## Customization

### Changing Panel Widths

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      width: {
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
      }
    }
  }
}
```

### Hiding Panels

```tsx
// Hide projects panel
<div className={showProjects ? 'lg:col-span-1' : 'hidden'}>
```

### Custom Grid Layouts

```css
/* 2-column layout (Agents + Tasks only) */
.content {
  grid-template-columns: 280px 1fr;
}

/* Wide main content */
.content {
  grid-template-columns: 240px 2fr 1fr;
}
```

---

## Troubleshooting

### Layout Issues

**Issue: Panels don't fill height**
- **Fix:** Ensure `min-height: 100vh` on root container

**Issue: Scrollbar overlaps content**
- **Fix:** Add `pr-2` (padding-right) to scrollable containers

**Issue: Header doesn't stay fixed**
- **Fix:** Verify `position: sticky; top: 0; z-index: 100;`

---

**Last Updated:** February 18, 2026  
**Version:** 1.0.0 (Phase 5)
