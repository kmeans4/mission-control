# QA Verification Checklist - Mission Control Logs & Monitoring

**Prepared for:** Mantis (QA Specialist)  
**Version:** 1.0.0  
**Date:** 2026-02-19

---

## 📋 Deliverables Verification

### 1. Frontend Dashboard Files
- [ ] `logs/dashboard.html` - Main UI with 5 sections
- [ ] `logs/dashboard.js` - Client-side logic & real-time updates
- [ ] Tab switching between all 5 panels works
- [ ] Chart.js integration loads correctly

### 2. Live Log Viewer
- [ ] Real-time log display (1s refresh)
- [ ] Agent filter dropdown (Sam, Quinn, Dex, Mantis, Echo)
- [ ] Severity filter (Error, Warning, Info)
- [ ] Text search functionality
- [ ] Auto-scroll toggle (on/off)
- [ ] Download logs button exports to file
- [ ] Clear logs button works
- [ ] Error highlighting (red background)
- [ ] Warning highlighting (yellow background)
- [ ] Timestamps display correctly

### 3. Error Dashboard
- [ ] Current error count displayed prominently
- [ ] Errors/hour metric calculates correctly
- [ ] Auto-fixed counter tracks fixes
- [ ] Error frequency chart renders (24-hour view)
- [ ] Recent errors list shows with timestamps
- [ ] Stack trace expandable on click
- [ ] One-click fix button appears for known issues
- [ ] Export report button downloads file

### 4. Performance Monitor
- [ ] Token usage rate displays and updates
- [ ] Requests per minute metric shown
- [ ] Average response time in ms
- [ ] Memory usage percentage
- [ ] CPU usage percentage
- [ ] Disk space in GB
- [ ] Token usage chart updates live
- [ ] Alert thresholds configurable
- [ ] Save thresholds button persists to localStorage
- [ ] Threshold warnings trigger toasts

### 5. Notifications Center
- [ ] Toast notification toggle works
- [ ] Browser push toggle (checkbox)
- [ ] Sound alerts toggle works
- [ ] Email alerts toggle (checkbox)
- [ ] Event type toggles (error, warning, agent, health)
- [ ] Quiet hours mode with start/end times
- [ ] Notification history displays
- [ ] Sound plays on critical errors (when enabled)

### 6. Health Status
- [ ] Green/yellow/red health indicator dot
- [ ] Component status cards (Gateway, Ollama, Workspace, Browser)
- [ ] Status dots change color based on state
- [ ] Run Diagnostics button executes checks
- [ ] Diagnostics output panel displays results
- [ ] Fix Common Issues button runs fixes
- [ ] Last updated timestamp refreshes

### 7. Backend API Server
- [ ] `backend/server.js` runs without errors
- [ ] Server starts on port 3001 (or MC_PORT)
- [ ] API endpoints respond correctly:
  - [ ] GET /api/logs
  - [ ] GET /api/errors
  - [ ] GET /api/metrics
  - [ ] GET /api/health
  - [ ] GET /api/notifications
  - [ ] POST /api/notifications
  - [ ] GET /api/config/thresholds
  - [ ] POST /api/config/thresholds
- [ ] SSE endpoint /sse/logs streams data
- [ ] CORS headers present
- [ ] Static file serving works

### 8. Log Rotation Utility
- [ ] `backend/log-rotation.js rotate` executes
- [ ] Old logs deleted based on age
- [ ] Large logs rotated to archives
- [ ] Archive naming uses ISO timestamp
- [ ] Compression works when enabled
- [ ] Status command shows directory info
- [ ] Cleanup-agent command removes old agent logs
- [ ] Compact-errors command reduces error log size

### 9. Configuration
- [ ] `config/thresholds.json` loads correctly
- [ ] Alert thresholds configurable
- [ ] Notification settings present
- [ ] Refresh intervals configurable
- [ ] Log retention settings work
- [ ] Auto-fix configuration present
- [ ] Settings persist across restarts

### 10. Integration Layer
- [ ] `backend/integration.js` initializes
- [ ] Log tailing starts (or falls back to simulation)
- [ ] Agent spawn events tracked
- [ ] Agent death events tracked
- [ ] Real metrics collection (memory, CPU, disk)
- [ ] Health checks for components
- [ ] QA report generation works

### 11. Startup Script
- [ ] `start.sh` is executable
- [ ] Node.js version check works
- [ ] Port availability check works
- [ ] Startup message displays correctly
- [ ] --integration flag runs both processes
- [ ] Graceful shutdown on Ctrl+C

### 12. Styling & UX
- [ ] Dark theme consistent throughout
- [ ] Responsive layout on different screen sizes
- [ ] Hover states on interactive elements
- [ ] Loading states visible
- [ ] Error states displayed clearly
- [ ] Toast animations smooth
- [ ] Tab transitions work
- [ ] Charts are readable
- [ ] Font sizes legible
- [ ] Color contrast accessible

### 13. Real-time Updates
- [ ] Logs refresh every 1 second
- [ ] Metrics refresh every 5 seconds
- [ ] Health status refreshes every 30 seconds
- [ ] SSE connection maintains
- [ ] Auto-scroll follows new logs
- [ ] Charts update without full redraw

### 14. Error Handling
- [ ] Missing files handled gracefully
- [ ] API errors display user-friendly messages
- [ ] Connection errors show retry options
- [ ] Invalid input rejected with feedback
- [ ] Fallback to simulation when logs unavailable

### 15. Documentation
- [ ] README.md complete and accurate
- [ ] API endpoints documented
- [ ] Environment variables listed
- [ ] Cron examples provided
- [ ] Troubleshooting section helpful
- [ ] Integration guide clear

---

## 🧪 Test Scenarios

### Scenario 1: Normal Operation
1. Start server with `./start.sh`
2. Open dashboard in browser
3. Verify all 5 tabs load
4. Watch logs update in real-time
5. Confirm metrics change every 5 seconds
6. Check health status updates

**Expected:** All components functional, no errors

### Scenario 2: Error Simulation
1. Trigger an error in backend logs
2. Verify error appears in Live Logs (red)
3. Check Error Dashboard count increases
4. Confirm toast notification appears
5. Verify error in notification history

**Expected:** Error properly tracked and displayed

### Scenario 3: Filter Testing
1. Add multiple log entries from different agents
2. Filter by agent "sam" - only Sam logs show
3. Filter by level "ERROR" - only errors show
4. Search for specific text
5. Combine filters

**Expected:** Filters work correctly in combination

### Scenario 4: Threshold Alerts
1. Set token warning threshold to 100
2. Wait for metrics to exceed threshold
3. Verify warning toast appears
4. Check metric card shows warning color

**Expected:** Alerts trigger at correct thresholds

### Scenario 5: Log Rotation
1. Run `node log-rotation.js status`
2. Verify current log exists
3. Create large log file (>10MB)
4. Run rotation
5. Verify archive created, current.log empty

**Expected:** Rotation works as configured

### Scenario 6: Quiet Hours
1. Enable quiet hours 22:00-08:00
2. Trigger notification during quiet hours
3. Verify no sound plays
4. Toast still appears (if enabled)

**Expected:** Sound suppressed during quiet hours

---

## ✅ Sign-off

**QA Verified By:** Mantis  
**Date:** _______________  
**Status:** [ ] Pass [ ] Fail [ ] Needs Revision

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

**Next Step:** If passed, Sam notifies Kevin and updates Mission Control.
