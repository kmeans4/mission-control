import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_AGENTS = ['quinn', 'dex', 'mantis', 'echo', 'hawthorne'] as const;
type Agent = typeof ALLOWED_AGENTS[number];

interface SpawnAgentRequest {
  agent: Agent;
  task: string;
}

interface SpawnAgentResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SpawnAgentResponse>> {
  try {
    const body = await request.json() as SpawnAgentRequest;
    
    // Validate agent
    if (!body.agent || !ALLOWED_AGENTS.includes(body.agent)) {
      return NextResponse.json(
        { success: false, message: `Invalid agent. Must be one of: ${ALLOWED_AGENTS.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate task
    if (!body.task || typeof body.task !== 'string' || body.task.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Task is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    // Mock spawn - log the request
    console.log(`[spawn-agent] Agent: ${body.agent}, Task: ${body.task}`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `Agent ${body.agent} spawned successfully for task: ${body.task.substring(0, 50)}${body.task.length > 50 ? '...' : ''}`
    });
    
  } catch (error) {
    console.error('[spawn-agent] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
