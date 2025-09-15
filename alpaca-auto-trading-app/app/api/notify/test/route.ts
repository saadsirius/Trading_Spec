import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message = 'Test notification from Alpaca Auto-Trading App' } = body;

    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';

    // Send test notification
    await notificationService.sendWebPush(userId, {
      title: 'Test Notification',
      body: message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/trading',
        timestamp: Date.now(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test notification' 
      },
      { status: 500 }
    );
  }
}
