import { NextRequest, NextResponse } from 'next/server';
import { addTask } from '@/lib/data';
import type { AddTaskRequest } from '@/lib/types';

// Skip during static export
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: AddTaskRequest = await request.json();
    const { title, section, priority, description } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const newTask = addTask({
      title: title.trim(),
      section: section || 'To Do',
      priority: priority || 'medium',
      description: description || '',
      status: 'todo',
    });

    return NextResponse.json({
      success: true,
      task: newTask,
      message: `Task "${title}" added successfully`
    });

  } catch (error) {
    console.error('Failed to add task:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to add a task',
    example: {
      title: 'Example Task',
      section: 'To Do',
      priority: 'high',
      description: 'Task description'
    }
  });
}