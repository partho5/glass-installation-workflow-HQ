import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { scheduleOrder } from '@/libs/NotionService';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.orderId || !body.crewId || !body.scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields (orderId, crewId, scheduleDate)' },
        { status: 400 },
      );
    }

    // Schedule order in Notion
    const result = await scheduleOrder(
      body.orderId,
      body.crewId,
      body.scheduleDate,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error scheduling order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule order' },
      { status: 500 },
    );
  }
}
