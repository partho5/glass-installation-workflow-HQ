import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { saveJobProgress } from '@/libs/NotionService';

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
    if (!body.orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 },
      );
    }

    if (typeof body.currentStep !== 'number') {
      return NextResponse.json(
        { error: 'Missing currentStep' },
        { status: 400 },
      );
    }

    // Save progress to Notion
    const result = await saveJobProgress(body.orderId, {
      currentStep: body.currentStep,
      beforePhotos: body.beforePhotos || [],
      afterPhotos: body.afterPhotos || [],
      signatureUrl: body.signatureUrl || '',
      customerName: body.customerName || '',
      gpsLocation: body.gpsLocation || { lat: 0, lng: 0 },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save progress' },
      { status: 500 },
    );
  }
}
