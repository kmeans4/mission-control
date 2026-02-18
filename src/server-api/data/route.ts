import { NextResponse } from 'next/server';
import { loadData } from '@/lib/data';

// Skip during static export
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = loadData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Allow manual refresh
  try {
    const { rebuildData } = await import('@/lib/data');
    const data = rebuildData();
    return NextResponse.json({
      success: true,
      data,
      message: 'Data rebuilt successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to rebuild data' },
      { status: 500 }
    );
  }
}
