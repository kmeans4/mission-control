#!/usr/bin/env tsx
/**
 * Copy Data Script
 * Copies mission-control.json to dist folder after build
 */

import * as path from 'path';
import * as fs from 'fs';

const SOURCE_PATH = path.join(__dirname, '..', 'data', 'mission-control.json');
const DIST_DATA_DIR = path.join(__dirname, '..', 'dist', 'data');

async function main() {
  try {
    // Check if source exists
    if (!fs.existsSync(SOURCE_PATH)) {
      console.error('❌ Source data file not found:', SOURCE_PATH);
      console.error('   Run npm run build:data first');
      process.exit(1);
    }
    
    // Check if dist exists
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ Dist folder not found:', distPath);
      console.error('   Run next build first');
      process.exit(1);
    }
    
    // Create data directory in dist if needed
    if (!fs.existsSync(DIST_DATA_DIR)) {
      fs.mkdirSync(DIST_DATA_DIR, { recursive: true });
    }
    
    // Copy the file with both names for compatibility
    const destPath = path.join(DIST_DATA_DIR, 'mission-control.json');
    const destPath2 = path.join(DIST_DATA_DIR, 'dashboard-data.json');
    fs.copyFileSync(SOURCE_PATH, destPath);
    fs.copyFileSync(SOURCE_PATH, destPath2);
    console.log('✅ Data copied to dist/data/mission-control.json');
    console.log('✅ Data copied to dist/data/dashboard-data.json');
  } catch (error) {
    console.error('❌ Copy failed:', error);
    process.exit(1);
  }
}

main();
