import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { SpawnAgentRequest } from '@/lib/types';

const execAsync = promisify(exec);

// Skip during static export
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: SpawnAgentRequest = await request.json();
    const { agent, task } = body;

    if (!agent || !task) {
      return NextResponse.json(
        { error: 'Agent and task are required' },
        { status: 400 }
      );
    }

    // Validate agent name
    const validAgents = ['quinn', 'dex', 'mantis', 'echo', 'hawthorne'];
    if (!validAgents.includes(agent)) {
      return NextResponse.json(
        { error: `Invalid agent. Must be one of: ${validAgents.join(', ')}` },
        { status: 400 }
      );
    }

    // Escape the task for shell safety
    const escapedTask = task.replace(/"/g, '\\"');
    
    // Spawn the agent using openclaw CLI
    const command = `openclaw agent run ${agent} "${escapedTask}" --detach`;
    
    console.log(`🚀 Spawning agent: ${agent}`);
    console.log(`📝 Task: ${task.substring(0, 100)}${task.length > 100 ? '...' : ''}`);
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      env: { ...process.env }
    });

    if (stderr && !stderr.includes('spawned')) {
      console.warn('Agent spawn warning:', stderr);
    }

    return NextResponse.json({
      success: true,
      agent,
      message: `Agent ${agent} spawned successfully`,
      output: stdout.trim()
    });

  } catch (error) {
    console.error('Failed to spawn agent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to spawn agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}