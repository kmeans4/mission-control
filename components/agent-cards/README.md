# 🧠 Agent Cards Component

Interactive dashboard component for the Mission Control agent fleet.

## Files

- `agent-cards.html` - Main dashboard with 6 agent cards
- `agent-cards.css` - Component styles (animated status, modals, cards)
- `agent-cards.js` - Interactivity (click modal, spawn buttons, status updates)
- `index.ts` - TypeScript definitions

## Agents

| Agent | Emoji | Role | Model | Status |
|-------|-------|------|-------|--------|
| Sam | 🧠 | Orchestrator | ollama/kimi-k2.5:cloud | 🟢 Online |
| Quinn | 🦎 | Code Architect | ollama/qwen3.5:cloud | 🟢 Online |
| Dex | 🎯 | Implementer | ollama/qwen3.5:cloud | 🟡 Idle |
| Mantis | 🪲 | Research/QA | ollama/glm-5:cloud | 🔴 Offline |
| Echo | 🔊 | Reporter | ollama/phi4-mini:latest | 🔴 Offline |
| Hawthorne | 🦅 | Context Pruner | ollama/granite4:1b | 🟡 Idle |

## Usage

Open `agent-cards.html` in a browser to view the dashboard.

### Features

- **Click any card** to open the detailed modal
- **Animated status indicators** (pulse for online agents)
- **Token usage bars** with today/week/total metrics
- **Quick spawn buttons** (logs to console)
- **Keyboard support** (ESC to close modal)

### JavaScript API

```javascript
// Update agent status
window.AgentCards.updateStatus('mantis', 'online');

// Update token usage
window.AgentCards.updateTokens('sam', {
  today: '50K',
  todayPct: 50
});

// Get agent data
const agent = window.AgentCards.getAgent('quinn');

// List all agents
const agents = window.AgentCards.getAllAgents();
```

## Modal Features

Each agent modal displays:
- Full bio
- Skills tag cloud
- Token usage bars (today/week/total)
- Quick action buttons with console logging
