#!/usr/bin/env tsx
/**
 * Build Data Script
 * Generates mission-control.json from markdown source files
 */

import * as path from 'path';
import * as fs from 'fs';
import { buildData, saveData } from '../src/lib/parser';

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mission-control.json');
const PUBLIC_DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const DIST_DATA_DIR = path.join(__dirname, '..', 'dist', 'data');

async function main() {
  console.log('🔨 Building Mission Control data...');
  
  try {
    const data = buildData();
    saveData(data, OUTPUT_PATH);
    console.log(`✅ Data saved to ${OUTPUT_PATH}`);
    console.log(`   Agents: ${data.agents.length}`);
    console.log(`   Tasks: ${data.tasks.length}`);
    console.log(`   Projects: ${data.projects.length}`);
    console.log(`   Last updated: ${data.lastUpdated}`);
    
    // Copy to public folder for development
    if (!fs.existsSync(PUBLIC_DATA_DIR)) {
      fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
    }
    fs.copyFileSync(OUTPUT_PATH, path.join(PUBLIC_DATA_DIR, 'mission-control.json'));
    console.log(`✅ Copied to public/data/mission-control.json`);
    
    // Copy to dist folder if it exists (for production)
    if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
      if (!fs.existsSync(DIST_DATA_DIR)) {
        fs.mkdirSync(DIST_DATA_DIR, { recursive: true });
      }
      fs.copyFileSync(OUTPUT_PATH, path.join(DIST_DATA_DIR, 'mission-control.json'));
      console.log(`✅ Copied to dist/data/mission-control.json`);
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();