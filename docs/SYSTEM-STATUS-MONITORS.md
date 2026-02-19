# System Status Monitors Documentation

## Overview

The Mission Control Dashboard provides real-time visibility into the health and status of the OpenClaw agent system through comprehensive status monitors for Gateway, Nodes, Agents, and Sessions.

---

## Status Monitor Types

### 1. Gateway Status

The Gateway daemon is the central orchestrator of the OpenClaw system.

#### Status Indicators

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| **Running** | 🟢 | Green | Gateway daemon active and healthy |
| **Starting** | 🟡 | Yellow | Gateway initializing |
| **Stopped** | 🔴 | Red | Gateway daemon not running |
| **Error** | ⚠️ | Orange | Gateway running with errors |

#### Monitoring Endpoint

```bash
# Check Gateway status via CLI
openclaw gateway status

# Response
{
  "status": "running",
  "version": "2.1.0",
  "uptime": "4h 32m",
  "pid": 12345,
  "memory": "256MB",
  "connections": {
    "nodes": 3,
    "sessions": 5
  }
}
```

#### Integration with Dashboard

**Current Implementation (Phase 5):**
```tsx
// Static status display (manual updates)
const gatewayStatus = {
  status: 'running',
  uptime: '4h 32m',
  version: '2.1.0'
};

// Display in dashboard
<div className="status-monitor">
  <span className={`status-dot ${gatewayStatus.status}`} />
  <span>Gateway: {gatewayStatus.status}</span>
</div>
```

**Planned Implementation (Phase 6):**
```tsx
// Real-time polling
useEffect(() => {
  const fetchGatewayStatus = async () => {
    const response = await fetch('/api/gateway/status');
    const status = await response.json();
    setGatewayStatus(status);
  };
  
  fetchGatewayStatus();
  const interval = setInterval(fetchGatewayStatus, 5000);
  return () => clearInterval(interval);
}, []);
```

#### Health Checks

| Check | Frequency | Threshold |
|-------|-----------|-----------|
| Process Running | 5s | PID exists |
| Memory Usage | 30s | < 512MB |
| CPU Usage | 30s | < 80% |
| Connection Count | 10s | < 100 active |
| Response Time | 10s | < 100ms |

---

### 2. Node Status

Nodes are paired devices that extend OpenClaw capabilities (cameras, speakers, browser control, etc.).

#### Node Status Indicators

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| **Connected** | 🟢 | Green | Node online and responsive |
| **Connecting** | 🟡 | Yellow | Establishing connection |
| **Disconnected** | 🔴 | Red | Node offline or unreachable |
| **Busy** | 🟣 | Purple | Node processing command |

#### Monitoring API

```typescript
// GET /api/nodes
interface NodeStatus {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'busy';
  lastSeen: string;  // ISO timestamp
  capabilities: string[];
  battery?: number;  // Percentage (mobile nodes)
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

#### Example Response

```json
{
  "nodes": [
    {
      "id": "node_1",
      "name": "Sam's Mac mini",
      "status": "connected",
      "lastSeen": "2026-02-18T23:35:00.000Z",
      "capabilities": ["browser", "camera", "screen", "notify"],
      "battery": null
    },
    {
      "id": "node_2",
      "name": "iPhone 15 Pro",
      "status": "connected",
      "lastSeen": "2026-02-18T23:34:55.000Z",
      "capabilities": ["camera", "location", "notify"],
      "battery": 78
    }
  ]
}
```

#### Dashboard Component

```tsx
function NodeStatusMonitor() {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  
  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="node-status-grid">
      {nodes.map(node => (
        <NodeCard key={node.id} node={node} />
      ))}
    </div>
  );
}

function NodeCard({ node }: { node: NodeStatus }) {
  return (
    <div className="node-card">
      <div className="node-header">
        <span className={`status-dot ${node.status}`} />
        <h4>{node.name}</h4>
      </div>
      <div className="node-details">
        <span>Last seen: {formatRelative(node.lastSeen)}</span>
        {node.battery && (
          <span>Battery: {node.battery}%</span>
        )}
      </div>
      <div className="node-capabilities">
        {node.capabilities.map(cap => (
          <Badge key={cap}>{cap}</Badge>
        ))}
      </div>
    </div>
  );
}
```

---

### 3. Agent Status

Real-time visibility into AI agent availability and activity.

#### Agent States

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| **Active** | 🟢 | Green | Ready and processing tasks |
| **Busy** | 🟡 | Yellow | Currently executing task |
| **Idle** | ⚪ | Gray | Available but not assigned |
| **Offline** | 🔴 | Red | Agent not available |

#### Status Update Flow

```
Agent Initialization
        ↓
Register with Gateway
        ↓
Gateway Updates Dashboard
        ↓
Dashboard Polls for Changes (5s interval)
        ↓
UI Updates Status Indicator
```

#### Agent Status Structure

```typescript
interface AgentStatus {
  id: string;              // e.g., 'sam', 'dex', 'quinn'
  name: string;            // Display name
  role: string;            // e.g., 'Lead Assistant', 'Code Implementer'
  model: string;           // e.g., 'Kimi K2', 'DeepSeek Coder V2'
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentTask?: {
    id: string;
    title: string;
    startedAt: string;
    estimatedDuration?: number;  // seconds
  };
  lastActive: string;      // ISO timestamp
  temperature?: string;    // Model temperature setting
  specialties: string[];   // Agent capabilities
}
```

#### Example Agent Data

```json
{
  "agents": [
    {
      "id": "sam",
      "name": "Sam",
      "role": "Lead Assistant",
      "model": "Kimi K2",
      "status": "active",
      "currentTask": {
        "id": "task_123",
        "title": "Update documentation",
        "startedAt": "2026-02-18T23:30:00.000Z"
      },
      "lastActive": "2026-02-18T23:35:00.000Z",
      "specialties": ["Orchestration", "Planning", "Coordination"]
    },
    {
      "id": "dex",
      "name": "Dex",
      "role": "Code Implementer",
      "model": "DeepSeek Coder V2 (Local)",
      "status": "busy",
      "currentTask": {
        "id": "task_124",
        "title": "Implement invoice feature",
        "startedAt": "2026-02-18T23:25:00.000Z",
        "estimatedDuration": 600
      },
      "lastActive": "2026-02-18T23:35:00.000Z",
      "specialties": ["CRUD", "UI Components", "Fast"]
    },
    {
      "id": "quinn",
      "name": "Quinn",
      "role": "Code Architect & Reviewer",
      "model": "Qwen 3 Coder Next (Cloud)",
      "status": "idle",
      "lastActive": "2026-02-18T23:30:00.000Z",
      "specialties": ["Architecture", "Code Review", "Complex"]
    }
  ]
}
```

#### Dashboard Component

```tsx
function AgentStatusMonitor() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  
  return (
    <div className="agent-status-grid">
      {agents.map(agent => (
        <AgentStatusCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function AgentStatusCard({ agent }: { agent: AgentStatus }) {
  const statusColors = {
    active: 'bg-green-500',
    busy: 'bg-amber-500',
    idle: 'bg-gray-500',
    offline: 'bg-red-500'
  };
  
  return (
    <div className="agent-card">
      <div className="agent-header">
        <Avatar>{agent.name[0]}</Avatar>
        <div>
          <h4>{agent.name}</h4>
          <p className="agent-role">{agent.role}</p>
        </div>
        <span className={`status-dot ${statusColors[agent.status]}`} />
      </div>
      
      <div className="agent-details">
        <p>Model: {agent.model}</p>
        <p>Status: <span className={agent.status}>{agent.status}</span></p>
        {agent.currentTask && (
          <div className="current-task">
            <p>Current Task: {agent.currentTask.title}</p>
            <ProgressBar 
              started={agent.currentTask.startedAt}
              estimated={agent.currentTask.estimatedDuration}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 4. Session Status

Track active agent sessions and subagent runs.

#### Session Types

| Type | Description | Lifecycle |
|------|-------------|-----------|
| **Main Session** | Direct chat with user | Persistent |
| **Subagent Session** | Spawned for specific task | Task-bound |
| **Heartbeat Session** | Periodic background checks | Recurring |
| **Cron Session** | Scheduled task execution | Time-based |

#### Session Status Indicators

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| **Active** | 🟢 | Green | Session currently processing |
| **Waiting** | 🟡 | Yellow | Session awaiting input/response |
| **Completed** | ⚪ | Gray | Session finished successfully |
| **Failed** | 🔴 | Red | Session terminated with error |
| **Killed** | ⚫ | Black | Session manually terminated |

#### Session Status API

```typescript
// GET /api/sessions
interface SessionStatus {
  id: string;
  label?: string;
  kind: 'main' | 'subagent' | 'heartbeat' | 'cron';
  status: 'active' | 'waiting' | 'completed' | 'failed' | 'killed';
  agentId: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;  // seconds
  messageCount: number;
  error?: string;
  task?: string;  // For subagent sessions
  result?: string;  // Subagent result preview
}
```

#### Example Response

```json
{
  "sessions": [
    {
      "id": "agent:main:0a5b01c7",
      "label": "Documentation Update",
      "kind": "main",
      "status": "active",
      "agentId": "sam",
      "startedAt": "2026-02-18T23:30:00.000Z",
      "messageCount": 12
    },
    {
      "id": "agent:dex:subagent:3f50afad",
      "label": "dex-docs",
      "kind": "subagent",
      "status": "active",
      "agentId": "dex",
      "task": "Update README.md with complete setup instructions",
      "startedAt": "2026-02-18T23:31:00.000Z",
      "messageCount": 3
    },
    {
      "id": "agent:main:cron:bc45",
      "label": "Heartbeat Check",
      "kind": "heartbeat",
      "status": "completed",
      "agentId": "sam",
      "startedAt": "2026-02-18T23:00:00.000Z",
      "endedAt": "2026-02-18T23:01:30.000Z",
      "duration": 90,
      "result": "Emails checked, calendar scanned"
    }
  ]
}
```

#### Dashboard Component

```tsx
function SessionStatusMonitor() {
  const [sessions, setSessions] = useState<SessionStatus[]>([]);
  
  return (
    <div className="session-list">
      <h3>Active Sessions</h3>
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Task</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <SessionRow key={session.id} session={session} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionRow({ session }: { session: SessionStatus }) {
  const statusClass = {
    active: 'status-active',
    waiting: 'status-waiting',
    completed: 'status-completed',
    failed: 'status-failed',
    killed: 'status-killed'
  }[session.status];
  
  return (
    <tr className={statusClass}>
      <td>{session.agentId}</td>
      <td>{session.kind}</td>
      <td>
        <span className={`status-badge ${session.status}`}>
          {session.status}
        </span>
      </td>
      <td>{formatDuration(session.duration)}</td>
      <td className="task-truncate">{session.task || '—'}</td>
    </tr>
  );
}
```

---

## Combined Status Dashboard

### Full System Overview

```tsx
function SystemStatusDashboard() {
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [sessions, setSessions] = useState<SessionStatus[]>([]);
  
  // Poll all status endpoints
  useEffect(() => {
    const fetchAllStatus = async () => {
      const [gatewayRes, nodesRes, agentsRes, sessionsRes] = await Promise.all([
        fetch('/api/gateway/status'),
        fetch('/api/nodes'),
        fetch('/api/agents'),
        fetch('/api/sessions')
      ]);
      
      setGateway(await gatewayRes.json());
      setNodes(await nodesRes.json());
      setAgents(await agentsRes.json());
      setSessions(await sessionsRes.json());
    };
    
    fetchAllStatus();
    const interval = setInterval(fetchAllStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="system-status-dashboard">
      <StatusHeader 
        gateway={gateway}
        healthyCount={countHealthy(nodes, agents, sessions)}
        totalNodes={nodes.length}
        totalAgents={agents.length}
        activeSessions={sessions.filter(s => s.status === 'active').length}
      />
      
      <div className="status-panels">
        <GatewayPanel gateway={gateway} />
        <NodesPanel nodes={nodes} />
        <AgentsPanel agents={agents} />
        <SessionsPanel sessions={sessions} />
      </div>
    </div>
  );
}
```

### Status Summary Card

```tsx
function StatusSummary() {
  return (
    <div className="status-summary">
      <div className="status-item">
        <GatewayIcon className="icon" />
        <span className="label">Gateway</span>
        <StatusBadge status="running" />
      </div>
      
      <div className="status-item">
        <NodesIcon className="icon" />
        <span className="label">Nodes</span>
        <span className="count">3/3 Online</span>
      </div>
      
      <div className="status-item">
        <AgentsIcon className="icon" />
        <span className="label">Agents</span>
        <span className="count">2 Active, 1 Idle</span>
      </div>
      
      <div className="status-item">
        <SessionsIcon className="icon" />
        <span className="label">Sessions</span>
        <span className="count">5 Running</span>
      </div>
    </div>
  );
}
```

---

## Polling Strategy

### Intervals by Status Type

| Status Type | Poll Interval | Rationale |
|-------------|---------------|-----------|
| Gateway | 5s | Critical infrastructure |
| Nodes | 10s | Connection status changes |
| Agents | 5s | Task state changes frequently |
| Sessions | 10s | Session lifecycle events |

### Implementation

```tsx
// Custom hook for status polling
function useStatusPolling<T>(
  endpoint: string,
  intervalMs: number = 5000
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, intervalMs);
    return () => clearInterval(interval);
  }, [endpoint, intervalMs]);
  
  return { data, loading, error };
}

// Usage
function Dashboard() {
  const { data: gateway, loading: gatewayLoading } = useStatusPolling<GatewayStatus>('/api/gateway', 5000);
  const { data: nodes } = useStatusPolling<NodeStatus[]>('/api/nodes', 10000);
  const { data: agents } = useStatusPolling<AgentStatus[]>('/api/agents', 5000);
  const { data: sessions } = useStatusPolling<SessionStatus[]>('/api/sessions', 10000);
  
  // ...
}
```

---

## Alerting & Notifications

### Status Change Alerts

```typescript
interface AlertConfig {
  type: 'gateway_down' | 'node_offline' | 'agent_error' | 'session_failed';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action?: () => void;
}

function useStatusAlerts() {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  
  // Monitor for gateway status changes
  useEffect(() => {
    if (gateway?.status === 'stopped' && prevGateway?.status === 'running') {
      setAlerts(prev => [...prev, {
        type: 'gateway_down',
        severity: 'critical',
        message: 'Gateway daemon has stopped unexpectedly',
        action: () => openclaw.gateway.start()
      }]);
    }
  }, [gateway]);
  
  // Monitor for node disconnections
  useEffect(() => {
    const disconnectedNodes = nodes.filter(n => n.status === 'disconnected');
    if (disconnectedNodes.length > 0) {
      setAlerts(prev => [...prev, {
        type: 'node_offline',
        severity: 'warning',
        message: `${disconnectedNodes.length} node(s) offline`
      }]);
    }
  }, [nodes]);
  
  return { alerts, dismissAlert: (id) => setAlerts(prev => prev.filter(a => a.id !== id)) };
}
```

### Alert Display Component

```tsx
function AlertPanel({ alerts, onDismiss }: { alerts: AlertConfig[], onDismiss: (id: string) => void }) {
  const severityStyles = {
    critical: 'bg-red-500/20 border-red-500 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400'
  };
  
  return (
    <div className="alert-panel">
      {alerts.map(alert => (
        <div className={`alert ${severityStyles[alert.severity]}`}>
          <AlertIcon severity={alert.severity} />
          <span>{alert.message}</span>
          {alert.action && (
            <button onClick={alert.action}>Take Action</button>
          )}
          <button onClick={() => onDismiss(alert.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

---

## CSS Styling

### Status Indicators

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.running,
.status-dot.connected,
.status-dot.active {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.status-dot.starting,
.status-dot.connecting,
.status-dot.busy,
.status-dot.waiting {
  background: #f59e0b;
}

.status-dot.stopped,
.status-dot.disconnected,
.status-dot.offline,
.status-dot.failed {
  background: #ef4444;
}

.status-dot.idle,
.status-dot.completed {
  background: #6a6a7a;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-dot.busy {
  animation: pulse 1s infinite;
}
```

---

## API Reference

### GET /api/gateway/status

Get Gateway daemon status.

**Response:**
```json
{
  "status": "running",
  "version": "2.1.0",
  "uptime": "4h 32m",
  "pid": 12345,
  "memory": "256MB"
}
```

### GET /api/nodes

List all paired nodes with status.

**Response:**
```json
{
  "nodes": [
    {
      "id": "node_1",
      "name": "Sam's Mac mini",
      "status": "connected",
      "lastSeen": "2026-02-18T23:35:00.000Z",
      "capabilities": ["browser", "camera"]
    }
  ]
}
```

### GET /api/agents

Get all agents with current status.

**Response:**
```json
{
  "agents": [
    {
      "id": "sam",
      "name": "Sam",
      "status": "active",
      "currentTask": { ... }
    }
  ]
}
```

### GET /api/sessions

List all active sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "agent:main:0a5b01c7",
      "kind": "main",
      "status": "active",
      "agentId": "sam"
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**Issue: Status shows "Offline" for all agents**
- **Cause:** Gateway daemon not running
- **Fix:** Run `openclaw gateway start`

**Issue: Node status not updating**
- **Cause:** Network connectivity issue
- **Fix:** Check node network connection and firewall

**Issue: Session count incorrect**
- **Cause:** Completed sessions not cleaned up
- **Fix:** Run session cleanup or wait for auto-expiry

---

**Last Updated:** February 18, 2026  
**Version:** 1.0.0 (Phase 5)
