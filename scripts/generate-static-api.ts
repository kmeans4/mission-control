#!/usr/bin/env tsx
/**
 * Generate static API JSON files for GitHub Pages deployment
 * Converts API routes to static JSON files in dist/api/
 */

import * as path from 'path';
import * as fs from 'fs';

const DIST_DIR = path.join(__dirname, '..', 'dist');
const DATA_FILE = path.join(__dirname, '..', 'data', 'mission-control.json');
const WORKSPACE = '/Users/sam/.openclaw/workspace';

function generateStaticAPI() {
  console.log('🔧 Generating static API files...');
  
  const apiDir = path.join(DIST_DIR, 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Read data file
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  // Generate /api/agents.json
  fs.writeFileSync(
    path.join(apiDir, 'agents.json'),
    JSON.stringify({ success: true, agents: data.agents || [], count: data.agents?.length || 0 }, null, 2)
  );
  console.log('✅ Generated /api/agents.json');

  // Generate /api/tasks.json
  fs.writeFileSync(
    path.join(apiDir, 'tasks.json'),
    JSON.stringify({ success: true, tasks: data.tasks || [], count: data.tasks?.length || 0 }, null, 2)
  );
  console.log('✅ Generated /api/tasks.json');

  // Generate /api/projects.json
  fs.writeFileSync(
    path.join(apiDir, 'projects.json'),
    JSON.stringify({ success: true, projects: data.projects || [], count: data.projects?.length || 0 }, null, 2)
  );
  console.log('✅ Generated /api/projects.json');

  // Generate /api/gateway-status.json
  fs.writeFileSync(
    path.join(apiDir, 'gateway-status.json'),
    JSON.stringify({ 
      success: true, 
      status: 'online', 
      message: 'Gateway is running (static snapshot)',
      timestamp: new Date().toISOString()
    }, null, 2)
  );
  console.log('✅ Generated /api/gateway-status.json');

  // Generate placeholder files for POST endpoints
  fs.writeFileSync(
    path.join(apiDir, 'add-task.json'),
    JSON.stringify({ 
      success: true, 
      message: 'Task addition requires live server. Use development mode for full functionality.',
      note: 'Static deployment - POST not available'
    }, null, 2)
  );
  console.log('✅ Generated /api/add-task.json');

  fs.writeFileSync(
    path.join(apiDir, 'spawn-agent.json'),
    JSON.stringify({ 
      success: true, 
      message: 'Agent spawn requires live server. Use development mode for full functionality.',
      note: 'Static deployment - POST not available'
    }, null, 2)
  );
  console.log('✅ Generated /api/spawn-agent.json');

  fs.writeFileSync(
    path.join(apiDir, 'gateway-restart.json'),
    JSON.stringify({ 
      success: true, 
      message: 'Gateway restart requires live server. Use development mode for full functionality.',
      note: 'Static deployment - POST not available'
    }, null, 2)
  );
  console.log('✅ Generated /api/gateway-restart.json');

  fs.writeFileSync(
    path.join(apiDir, 'update-project.json'),
    JSON.stringify({ 
      success: true, 
      message: 'Project update requires live server. Use development mode for full functionality.',
      note: 'Static deployment - POST not available'
    }, null, 2)
  );
  console.log('✅ Generated /api/update-project.json');

  console.log('✅ All static API files generated');
}

generateStaticAPI();
