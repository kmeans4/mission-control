import { NextRequest, NextResponse } from 'next/server';
import { updateProject } from '@/lib/data';
import type { UpdateProjectRequest } from '@/lib/types';

// Skip during static export
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: UpdateProjectRequest = await request.json();
    const { projectId, status, pending, details } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const updates: Partial<{ status: string; pending: string[]; details: Record<string, string | string[]> }> = {};
    
    if (status) updates.status = status;
    if (pending) updates.pending = Array.isArray(pending) ? pending : [pending];
    if (details) updates.details = details;

    const success = updateProject(projectId, updates);

    if (!success) {
      return NextResponse.json(
        { error: `Project "${projectId}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId,
      updates,
      message: `Project "${projectId}" updated successfully`
    });

  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to update a project',
    example: {
      projectId: 'project-name',
      status: 'In Progress',
      pending: ['Item 1', 'Item 2'],
      details: { key: 'value' }
    }
  });
}