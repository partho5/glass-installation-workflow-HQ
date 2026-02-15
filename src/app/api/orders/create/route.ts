import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createOrder } from '@/libs/NotionService';

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
    if (!body.clientId || !body.unitNumber || !body.truckModelId || !body.glassPosition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create order in Notion
    const result = await createOrder({
      clientId: body.clientId,
      unitNumber: body.unitNumber,
      truckModelId: body.truckModelId,
      glassPosition: body.glassPosition,
      notes: body.notes || '',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 },
    );
  }
}
