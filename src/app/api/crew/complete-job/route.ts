import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { completeJob } from '@/libs/NotionService';

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

    if (!body.beforePhotos || body.beforePhotos.length !== 3) {
      return NextResponse.json(
        { error: 'Exactly 3 before photos are required' },
        { status: 400 },
      );
    }

    if (!body.afterPhotos || body.afterPhotos.length !== 1) {
      return NextResponse.json(
        { error: 'Exactly 1 after photo is required' },
        { status: 400 },
      );
    }

    if (!body.signatureUrl) {
      return NextResponse.json(
        { error: 'Customer signature is required' },
        { status: 400 },
      );
    }

    if (!body.customerName || body.customerName.trim() === '') {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 },
      );
    }

    if (!body.gpsLocation || typeof body.gpsLocation.lat !== 'number') {
      return NextResponse.json(
        { error: 'GPS location is required' },
        { status: 400 },
      );
    }

    // Complete job in Notion
    const result = await completeJob({
      pageId: body.orderId,
      beforePhotos: body.beforePhotos,
      afterPhotos: body.afterPhotos,
      signatureUrl: body.signatureUrl,
      customerName: body.customerName,
      gpsLocation: body.gpsLocation,
      userId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error completing job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete job' },
      { status: 500 },
    );
  }
}
