import type { NextRequest } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

    // TODO: Add admin role check here in production
    // For now, any authenticated user can assign crews
    // In production, you should check if userId has admin role

    const body = await req.json();

    // Validate required fields
    if (!body.userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 },
      );
    }

    // Get Clerk client
    const client = await clerkClient();

    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [body.userEmail],
    });

    if (!users.data || users.data.length === 0) {
      return NextResponse.json(
        { error: `No user found with email: ${body.userEmail}` },
        { status: 404 },
      );
    }

    const targetUser = users.data[0];
    if (!targetUser) {
      return NextResponse.json(
        { error: `User not found` },
        { status: 404 },
      );
    }

    // Update user metadata
    const metadata = body.crewId
      ? { notion_crew_id: body.crewId } // Assign crew
      : {}; // Remove crew assignment

    await client.users.updateUserMetadata(targetUser.id, {
      unsafeMetadata: metadata,
    });

    return NextResponse.json({
      success: true,
      message: body.crewId
        ? `Assigned ${body.userEmail} to crew ${body.crewId}`
        : `Removed crew assignment for ${body.userEmail}`,
      userId: targetUser.id,
    });
  } catch (error: any) {
    console.error('Error assigning crew:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign crew' },
      { status: 500 },
    );
  }
}
