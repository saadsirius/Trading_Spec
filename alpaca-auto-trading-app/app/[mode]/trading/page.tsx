import { notFound } from "next/navigation";
import TradingDashboard from "../../(trading)/components/TradingDashboard";

interface TradingModePageProps {
  params: {
    mode: string;
  };
}

export default function TradingModePage({ params }: TradingModePageProps) {
  // Handle case where params might be undefined during static generation
  if (!params) {
    return <div>Loading...</div>;
  }
  
  const { mode } = params;
  
  // Validate mode parameter
  if (mode !== 'paper' && mode !== 'live') {
    notFound();
  }

  return <TradingDashboard mode={mode as 'paper' | 'live'} />;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
