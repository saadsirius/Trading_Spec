import { NextRequest, NextResponse } from 'next/server';
import { getRequestId } from '@/src/server/middleware/requestId';
import { withLogging } from '@/src/server/middleware/logging';
import { createRequestLogger } from '@/src/server/logging/structured';

async function handler(req: NextRequest) {
  const logger = createRequestLogger(req);
  const requestId = getRequestId(req);
  
  logger.info('Processing example request');
  
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    logger.info('Example request completed successfully');
    
    return NextResponse.json({ 
      message: 'Hello from example API',
      requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Example request failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(handler);
