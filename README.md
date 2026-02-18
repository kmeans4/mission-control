# 🚀 Mission Control

A task and project tracking dashboard built for Kevin's workflow — now with **file-based sync** so Sam can see your tasks!

## What This Is

Based on [Bhanu Teja's multi-agent Mission Control system](https://x.com/pbteja1998/status/2017662163540971756), this is a simplified version focused on **tracking tasks across your projects** (CashedBets, ProjectTrackr, etc.).

## ✨ New: File-Based Sync

**Sam can now see your tasks automatically!** Here's how it works:

- Tasks are saved to `tasks.json` (in this folder)
- I can read this file anytime — no need to notify me
- Auto-refresh every 10 seconds — no need to reload the page
- Sync status indicator in the header (🟢 Synced / 🟡 Syncing)

### How to Start the Server

```bash
cd ~/.openclaw/workspace/mission-control
node server.js
```

Then open: **http://localhost:3456**

## Features

### 📊 Kanban Board
- **5 columns**: Inbox → Assigned → In Progress → Review → Done
- Drag-and-drop tasks between columns
- Click any task to see details and add comments

### 📈 Stats Overview
- Quick view of task counts by status
- Track progress at a glance

### 🏷️ Project Tracking
- Filter by project: CashedBets, ProjectTrackr, or General
- Color-coded tags for each project

### 📝 Task Management
- Create new tasks with title, description, priority, due date
- Add comments to tasks for tracking progress
- Data persists in `tasks.json` (not browser localStorage anymore!)

### 📱 Sidebar
- **Agents & Projects**: Switch between different project views
- **Activity Feed**: See recent actions and updates

## How to Use

1. **Start the server**: `node server.js`
2. **Open the dashboard**: http://localhost:3456
3. **Create tasks**: Click "+ New Task" button
4. **Move tasks**: Drag cards between columns or click to edit
5. **Filter**: Click on CashedBets or ProjectTrackr in the sidebar to filter
6. **Sam sees everything**: I check this during my heartbeat runs

## Sam Integration

During my regular heartbeat checks, I can now:
- ✅ See all your tasks and their status
- ✅ Check what's in progress vs blocked
- ✅ Suggest next steps based on priorities
- ✅ Update you on project progress without asking

**Want me to check your tasks?** Just ask: *"What's on my Mission Control?"* or *"Any blockers in my projects?"*

## Data Storage

All data is saved to `tasks.json` in this folder:
- Human-readable JSON format
- I can read it directly
- Easy to backup or version control
- Old localStorage data is still there if you need to migrate

## Future Enhancements

The article describes a full multi-agent system with:
- Multiple AI agents (Jarvis, Shuri, Fury, etc.) each with specialized roles
- Convex database for real-time collaboration
- Cron jobs that wake agents every 15 minutes
- @mentions and notifications between agents
- Daily standup summaries

This dashboard is the foundation — and now with file sync, we're one step closer!

---

Built by Sam 🦊 for Kevin
