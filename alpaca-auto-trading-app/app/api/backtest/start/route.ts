import { NextResponse } from "next/server";
import { getServerFlags } from "@/lib/server-flags";

export async function POST(req: Request) {
  try {
    const flags = await getServerFlags();
    
    // Feature flag guard
    if (!flags.backtest) {
      return NextResponse.json(
        { 
          success: false,
          error: "Feature disabled",
          details: "Backtesting feature is currently disabled"
        }, 
        { status: 403 }
      );
    }

    // If feature is enabled, proceed with backtest logic
    const body = await req.json();
    
    // Mock backtest response
    return NextResponse.json({
      success: true,
      data: {
        id: "backtest_" + Date.now(),
        status: "running",
        message: "Backtest started successfully"
      }
    });

  } catch (error) {
    console.error('Error in backtest API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: "Failed to start backtest"
      },
      { status: 500 }
    );
  }
}
