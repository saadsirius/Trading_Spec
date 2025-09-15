import { NextRequest, NextResponse } from 'next/server';
import { SubscribeNotificationSchema } from '@/lib/validations/trading';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SubscribeNotificationSchema.parse(body);

    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';

    // Upsert the subscription
    const subscription = await prisma.notificationSubscription.upsert({
      where: { 
        userId_endpoint: {
          userId,
          endpoint: validatedData.endpoint,
        }
      },
      update: {
        p256dh: validatedData.keys.p256dh,
        auth: validatedData.keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId,
        endpoint: validatedData.endpoint,
        p256dh: validatedData.keys.p256dh,
        auth: validatedData.keys.auth,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: subscription.id },
    });
  } catch (error) {
    console.error('Notification subscription error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid subscription data', 
          details: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to subscribe to notifications' 
      },
      { status: 500 }
    );
  }
}
