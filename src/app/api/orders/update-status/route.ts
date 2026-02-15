import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/libs/NotionService';

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
    if (!body.orderId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields (orderId, status)' },
        { status: 400 },
      );
    }

    // Update order status in Notion
    const result = await updateOrderStatus(
      body.orderId,
      body.status,
      body.note,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 },
    );
  }
}
