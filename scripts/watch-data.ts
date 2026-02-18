#!/usr/bin/env tsx
/**
 * File Watcher Script
 * Watches markdown files and regenerates data.json on changes
 */

import * as path from 'path';
import * as fs from 'fs';
import { buildData, saveData } from '../src/lib/parser';

// Dynamic import for chokidar
async function getChokidar() {
  const { default: chokidar } = await import('chokidar');
  return chokidar;
}

const WORKSPACE = process.env.WORKSPACE_PATH || '/Users/sam/.openclaw/workspace';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mission-control.json');

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;

// Files to watch
const WATCH_PATTERNS = [
  path.join(WORKSPACE, 'AGENTS.md'),
  path.join(WORKSPACE, 'active-tasks.md'),
  path.join(WORKSPACE, 'projects.md'),
  path.join(WORKSPACE, 'agents/*/SOUL.md'),
];

async function rebuild() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(async () => {
    console.log('🔄 Changes detected, rebuilding...');
    try {
      const data = buildData();
      
      // Ensure data directory exists
      const dataDir = path.dirname(OUTPUT_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      saveData(data, OUTPUT_PATH);
      console.log(`✅ Data updated (${new Date().toLocaleTimeString()})`);
      console.log(`   Agents: ${data.agents.length}, Tasks: ${data.tasks.length}, Projects: ${data.projects.length}`);
    } catch (error) {
      console.error('❌ Rebuild failed:', error);
    }
  }, DEBOUNCE_MS);
}

async function main() {
  console.log('👀 Watching for changes in markdown files...');
  console.log('   Patterns:', WATCH_PATTERNS.map(p => p.replace(WORKSPACE, '~')).join(', '));
  console.log('   Output:', OUTPUT_PATH);
  
  const chokidar = await getChokidar();
  
  const watcher = chokidar.watch(WATCH_PATTERNS, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });
  
  // Initial build
  watcher.on('ready', () => {
    console.log('✨ Initial build complete');
    rebuild();
  });
  
  // Watch events
  watcher.on('add', (file) => {
    console.log(`📄 Added: ${path.basename(file)}`);
    rebuild();
  });
  
  watcher.on('change', (file) => {
    console.log(`📝 Changed: ${path.basename(file)}`);
    rebuild();
  });
  
  watcher.on('unlink', (file) => {
    console.log(`🗑️ Removed: ${path.basename(file)}`);
    rebuild();
  });
  
  watcher.on('error', (error) => {
    console.error('⚠️ Watch error:', error);
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n👋 Stopping watcher...');
    watcher.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    watcher.close();
    process.exit(0);
  });
}

main().catch(console.error);