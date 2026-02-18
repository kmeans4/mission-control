import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

interface UpdateProjectRequest {
  projectId: string;
  status?: string;
  pending?: string[];
}

interface UpdateProjectResponse {
  success: boolean;
  message: string;
}

const PROJECTS_FILE = '/Users/sam/.openclaw/workspace/projects.md';

export async function POST(request: NextRequest): Promise<NextResponse<UpdateProjectResponse>> {
  try {
    const body = await request.json() as UpdateProjectRequest;
    
    // Validate projectId
    if (!body.projectId || typeof body.projectId !== 'string' || body.projectId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'projectId is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const projectId = body.projectId.trim();
    
    // Read current projects file
    let content: string;
    try {
      content = await fs.readFile(PROJECTS_FILE, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Projects file not found' },
        { status: 500 }
      );
    }
    
    // Find the project section
    const projectHeader = `## ${projectId}`;
    const projectIndex = content.indexOf(projectHeader);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { success: false, message: `Project "${projectId}" not found` },
        { status: 404 }
      );
    }
    
    let updatedContent = content;
    
    // Update status if provided
    if (body.status !== undefined) {
      const statusPattern = new RegExp(`(## ${projectId}[^]*?\\*\\*Status:\\*\\*)[^\\n]*`, 'i');
      updatedContent = updatedContent.replace(statusPattern, `$1 ${body.status}`);
    }
    
    // Update pending items if provided
    if (body.pending !== undefined && Array.isArray(body.pending)) {
      const projectEndIndex = updatedContent.indexOf('\n## ', projectIndex + projectHeader.length);
      const projectSection = projectEndIndex !== -1 
        ? updatedContent.slice(projectIndex, projectEndIndex)
        : updatedContent.slice(projectIndex);
      
      // Find Pending section within project
      const pendingMatch = projectSection.match(/\*\*Pending:\*\*\n([\s\S]*?)(?=\n\n## |\n\n# |$)/);
      if (pendingMatch) {
        const newPending = body.pending.length > 0
          ? body.pending.map(item => `- ${item}`).join('\n')
          : '- None';
        
        const oldPending = pendingMatch[0];
        const newPendingSection = '**Pending:**\n' + newPending;
        
        updatedContent = updatedContent.replace(oldPending, newPendingSection);
      }
    }
    
    // Write updated content
    await fs.writeFile(PROJECTS_FILE, updatedContent, 'utf-8');
    
    console.log(`[update-project] Updated project: "${projectId}"`);
    
    return NextResponse.json({
      success: true,
      message: `Project "${projectId}" updated successfully`
    });
    
  } catch (error) {
    console.error('[update-project] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
