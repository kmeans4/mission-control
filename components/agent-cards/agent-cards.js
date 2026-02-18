/**
 * Agent Cards Dashboard - Interactive Component
 * Handles card clicks, modal display, and spawn actions
 */

// Agent data configuration
const AGENT_DATA = {
  sam: {
    name: 'Sam',
    emoji: '🧠',
    role: 'Orchestrator',
    model: 'ollama/kimi-k2.5:cloud',
    status: 'online',
    statusDisplay: '🟢 Online',
    bio: 'The central coordinator. Sam manages task delegation, session context, and inter-agent communication. Keeps the fleet synchronized and ensures no tasks fall through the cracks. Expert in breaking down complex projects and routing them to the right specialist agents.',
    skills: ['Task Orchestration', 'Context Management', 'Agent Coordination', 'Project Planning', 'Workflow Design', 'Session Management'],
    tokens: {
      today: '45K',
      week: '672K',
      total: '8.2M',
      todayPct: 45,
      weekPct: 67,
      totalPct: 82
    }
  },
  quinn: {
    name: 'Quinn',
    emoji: '🦎',
    role: 'Code Architect',
    model: 'ollama/qwen3.5:cloud',
    status: 'online',
    statusDisplay: '🟢 Online',
    bio: 'The systems thinker. Quinn designs architecture, reviews code structure, and ensures technical decisions align with long-term goals. Specializes in finding elegant solutions to complex technical challenges and maintaining code quality standards.',
    skills: ['System Design', 'Code Review', 'Architecture Planning', 'Technical Strategy', 'Pattern Recognition', 'Refactoring'],
    tokens: {
      today: '62K',
      week: '892K',
      total: '12.4M',
      todayPct: 62,
      weekPct: 89,
      totalPct: 92
    }
  },
  dex: {
    name: 'Dex',
    emoji: '🎯',
    role: 'Implementer',
    model: 'ollama/qwen3.5:cloud',
    status: 'idle',
    statusDisplay: '🟡 Idle',
    bio: 'The hands-on builder. Dex executes tasks, writes code, and ships features. Currently between assignments but ready to jump on the next implementation task. Fast, efficient, and focused on getting things done.',
    skills: ['Implementation', 'Code Generation', 'Feature Development', 'Bug Fixes', 'Rapid Prototyping', 'Testing'],
    tokens: {
      today: '38K',
      week: '445K',
      total: '6.1M',
      todayPct: 38,
      weekPct: 44,
      totalPct: 61
    }
  },
  mantis: {
    name: 'Mantis',
    emoji: '🪲',
    role: 'Research / QA',
    model: 'ollama/glm-5:cloud',
    status: 'offline',
    statusDisplay: '🔴 Offline',
    bio: 'The detail-oriented investigator. Mantis digs deep into problems, validates assumptions, and ensures quality. Currently offline but returns to hunt bugs and verify facts with precision. Expert at finding edge cases and validating solutions.',
    skills: ['Research', 'QA Testing', 'Fact Checking', 'Edge Case Analysis', 'Documentation', 'Validation'],
    tokens: {
      today: '0K',
      week: '234K',
      total: '3.8M',
      todayPct: 0,
      weekPct: 23,
      totalPct: 38
    }
  },
  echo: {
    name: 'Echo',
    emoji: '🔊',
    role: 'Reporter',
    model: 'ollama/phi4-mini:latest',
    status: 'offline',
    statusDisplay: '🔴 Offline',
    bio: 'The voice and chronicler. Echo crafts communication, summarizes findings, and keeps stakeholders informed. Currently offline but returns to handle reporting, documentation, and external communications with clarity and precision.',
    skills: ['Technical Writing', 'Summarization', 'Reporting', 'Documentation', 'Communication', 'Status Updates'],
    tokens: {
      today: '0K',
      week: '156K',
      total: '2.4M',
      todayPct: 0,
      weekPct: 15,
      totalPct: 24
    }
  },
  hawthorne: {
    name: 'Hawthorne',
    emoji: '🦅',
    role: 'Context Pruner',
    model: 'ollama/granite4:1b',
    status: 'idle',
    statusDisplay: '🟡 Idle',
    bio: 'The efficiency optimizer. Hawthorne trims context windows, removes redundancy, and keeps conversations focused. With a lean 1B parameter model, demonstrates that sometimes less is more when it comes to maintaining clarity.',
    skills: ['Context Optimization', 'Summarization', 'Token Efficiency', 'Noise Reduction', 'Window Management', 'Concision'],
    tokens: {
      today: '12K',
      week: '89K',
      total: '1.2M',
      todayPct: 12,
      weekPct: 8,
      totalPct: 12
    }
  }
};

// DOM Elements
const modal = document.getElementById('agent-modal');
const cards = document.querySelectorAll('.agent-card');
const closeBtn = document.querySelector('.modal-close');

// Modal elements
const modalEmoji = document.getElementById('modal-emoji');
const modalName = document.getElementById('modal-name');
const modalRole = document.getElementById('modal-role');
const modalStatus = document.getElementById('modal-status');
const modalBio = document.getElementById('modal-bio');
const modalSkills = document.getElementById('modal-skills');
const tokenToday = document.getElementById('token-today');
const tokenTodayVal = document.getElementById('token-today-val');
const tokenWeek = document.getElementById('token-week');
const tokenWeekVal = document.getElementById('token-week-val');
const tokenTotal = document.getElementById('token-total');
const tokenTotalVal = document.getElementById('token-total-val');

// Initialize
function init() {
  bindEvents();
  console.log('🧠 Agent Cards Dashboard initialized');
}

// Bind event listeners
function bindEvents() {
  // Card click handlers
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const agentId = card.dataset.agent;
      openModal(agentId);
    });
  });

  // Modal close handlers
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Spawn button handlers
  document.querySelectorAll('.spawn-btn').forEach(btn => {
    btn.addEventListener('click', handleSpawnAction);
  });
}

// Open modal with agent data
function openModal(agentId) {
  const agent = AGENT_DATA[agentId];
  if (!agent) return;

  // Populate modal
  modalEmoji.textContent = agent.emoji;
  modalName.textContent = agent.name;
  modalRole.textContent = agent.role;
  modalStatus.textContent = agent.statusDisplay;
  modalBio.textContent = agent.bio;

  // Populate skills
  modalSkills.innerHTML = agent.skills
    .map(skill => `<span class="skill-tag">${skill}</span>`)
    .join('');

  // Populate token usage
  tokenTodayVal.textContent = agent.tokens.today;
  tokenWeekVal.textContent = agent.tokens.week;
  tokenTotalVal.textContent = agent.tokens.total;
  
  tokenToday.style.width = `${agent.tokens.todayPct}%`;
  tokenWeek.style.width = `${agent.tokens.weekPct}%`;
  tokenTotal.style.width = `${agent.tokens.totalPct}%`;

  // Store current agent on modal for action handlers
  modal.dataset.currentAgent = agentId;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  console.log(`📊 Opened agent card: ${agent.name} ${agent.emoji}`);
}

// Close modal
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  delete modal.dataset.currentAgent;
}

// Handle spawn button actions
function handleSpawnAction(e) {
  const action = e.currentTarget.dataset.action;
  const agentId = modal.dataset.currentAgent;
  const agent = AGENT_DATA[agentId];

  if (!agent) return;

  const timestamp = new Date().toISOString();

  switch (action) {
    case 'spawn-task':
      console.log(`[${timestamp}] 📋 Spawn Task triggered for ${agent.name} (${agentId})`);
      console.log(`  → Task queue: /api/agents/${agentId}/tasks`);
      console.log(`  → Model: ${agent.model}`);
      break;

    case 'spawn-subagent':
      console.log(`[${timestamp}] 👥 Spawn Subagent triggered for ${agent.name} (${agentId})`);
      console.log(`  → Subagent endpoint: /api/agents/${agentId}/spawn`);
      console.log(`  → Parent: ${agentId}`);
      break;

    case 'send-message':
      console.log(`[${timestamp}] 💬 Send Message triggered for ${agent.name} (${agentId})`);
      console.log(`  → Message endpoint: /api/agents/${agentId}/message`);
      console.log(`  → Status: ${agent.status}`);
      break;

    case 'refresh-status':
      console.log(`[${timestamp}] 🔄 Refresh Status triggered for ${agent.name} (${agentId})`);
      console.log(`  → Polling: /api/agents/${agentId}/status`);
      console.log(`  → Current status: ${agent.statusDisplay}`);
      // Simulate status update
      setTimeout(() => {
        console.log(`✅ Status refreshed for ${agent.name}: ${agent.statusDisplay}`);
      }, 500);
      break;

    default:
      console.log(`[${timestamp}] ⚡ Unknown action: ${action} for ${agent.name}`);
  }

  // Visual feedback
  e.currentTarget.style.transform = 'scale(0.95)';
  setTimeout(() => {
    e.currentTarget.style.transform = '';
  }, 150);
}

// Public API for external status updates
window.AgentCards = {
  updateStatus(agentId, status) {
    const card = document.querySelector(`[data-agent="${agentId}"]`);
    if (!card) return;

    const indicator = card.querySelector('.status-indicator');
    const statusDot = card.querySelector('.status-indicator');

    // Update status classes
    indicator.className = `status-indicator ${status}`;
    if (status === 'online') {
      indicator.classList.add('pulse');
    }

    card.dataset.status = status;
    console.log(`🔄 Status updated: ${agentId} → ${status}`);
  },

  updateTokens(agentId, usage) {
    const agent = AGENT_DATA[agentId];
    if (agent && usage) {
      Object.assign(agent.tokens, usage);
      console.log(`📊 Token usage updated: ${agentId}`, usage);
    }
  },

  getAgent(agentId) {
    return AGENT_DATA[agentId];
  },

  getAllAgents() {
    return Object.keys(AGENT_DATA);
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
