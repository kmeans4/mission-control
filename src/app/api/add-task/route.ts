import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface AddTaskRequest {
  title: string;
  section?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface AddTaskResponse {
  success: boolean;
  message: string;
}

const TASKS_FILE = '/Users/sam/.openclaw/workspace/active-tasks.md';

export async function POST(request: NextRequest): Promise<NextResponse<AddTaskResponse>> {
  try {
    const body = await request.json() as AddTaskRequest;
    
    // Validate title
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const title = body.title.trim();
    const section = body.section || 'Next Up (Backlog)';
    const priority = body.priority || 'medium';
    
    // Create task entry
    const timestamp = new Date().toISOString().split('T')[0];
    const taskEntry = `- [ ] **${title}** — Added ${timestamp} (priority: ${priority})\n`;
    
    // Read current tasks file
    let content = '';
    try {
      content = await fs.readFile(TASKS_FILE, 'utf-8');
    } catch (error) {
      // File doesn't exist, create with header
      content = '# Active Tasks - Current Work\n\n';
    }
    
    // Find the section and add task there
    const sectionHeader = `## ${section}`;
    const sectionIndex = content.indexOf(sectionHeader);
    
    if (sectionIndex !== -1) {
      // Find the end of the section (next ## or end of file)
      const afterSection = sectionIndex + sectionHeader.length;
      const nextSectionIndex = content.indexOf('\n## ', afterSection);
      
      if (nextSectionIndex !== -1) {
        // Insert before the next section
        content = content.slice(0, nextSectionIndex) + taskEntry + content.slice(nextSectionIndex);
      } else {
        // Append to end of file
        content = content + '\n' + taskEntry;
      }
    } else {
      // Section doesn't exist, add it
      content = content + `\n## ${section}\n\n${taskEntry}`;
    }
    
    // Write updated content
    await fs.writeFile(TASKS_FILE, content, 'utf-8');
    
    console.log(`[add-task] Added task: "${title}" to section: "${section}"`);
    
    return NextResponse.json({
      success: true,
      message: `Task "${title}" added to ${section}`
    });
    
  } catch (error) {
    console.error('[add-task] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
