# Mission Control - Advanced Settings Requirements

## File Location
`/Users/sam/.openclaw/workspace/mission-control/advanced-settings.html`

## Four Sections Required

### 1. Gateway Controls
- Restart OpenClaw gateway button
- Clear stale sessions button
- Gateway status display (Running/Stopped/Error)
- Config editor for openclaw.json
- Test Ollama connections button

### 2. Agent Configuration
- Agent model dropdowns: kimi-k2.5:cloud, qwen3.5:cloud, glm-5:cloud, phi4-mini:latest, granite4:1b
- maxConcurrent number inputs
- Agent availability toggles
- Subagent spawn rules
- Timeout defaults

### 3. Theme & Personalization
- Theme selector with preview
- Accent color picker (hex validation)
- Font size: small/medium/large
- Sidebar position: left/right
- Density: compact/comfortable
- Reset to defaults button
- Export/import settings (JSON)

### 4. Notifications
- Toggle: heartbeat alerts
- Toggle: session bloat warnings
- Toggle: task reminders
- Discord webhook URL input (URL validation)
- Quiet hours: start/end time pickers

## Technical
- localStorage key: "mission-control-settings"
- Match existing Mission Control styling
- Save confirmation feedback
- Input validation for hex colors and webhook URLs
