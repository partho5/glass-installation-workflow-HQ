import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPricingForOrder } from '@/libs/NotionService';

export async function POST(req: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // 2. PARSE REQUEST
    const body = await req.json();
    const { clientId, truckModelId, glassPosition } = body;

    // 3. VALIDATE
    if (!clientId || !truckModelId || !glassPosition) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: clientId, truckModelId, glassPosition',
        },
        { status: 400 },
      );
    }

    // 4. LOOKUP PRICE
    const price = await getPricingForOrder(
      clientId,
      truckModelId,
      glassPosition,
    );

    // 5. RETURN RESULT
    return NextResponse.json({
      success: true,
      price, // Will be number or null
      found: price !== null,
    });
  } catch (error: any) {
    console.error('Error previewing price:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to preview price' },
      { status: 500 },
    );
  }
}
