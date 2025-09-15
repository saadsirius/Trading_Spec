import { notFound } from "next/navigation";
import { OverviewPage } from "../../(trading)/components/Overview/OverviewPage";

interface OverviewModePageProps {
  params: {
    mode: string;
  };
}

export default function OverviewModePage({ params }: OverviewModePageProps) {
  // Handle case where params might be undefined during static generation
  if (!params) {
    return <div>Loading...</div>;
  }
  
  const { mode } = params;
  
  // Validate mode parameter
  if (mode !== 'paper' && mode !== 'live') {
    notFound();
  }

  return <OverviewPage mode={mode as 'paper' | 'live'} />;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Add metadata
export async function generateMetadata({ params }: OverviewModePageProps) {
  // Handle case where params might be undefined during static generation
  if (!params) {
    return {
      title: 'Trading Overview',
      description: 'View your trading account overview, positions, orders, and watchlist.',
    };
  }
  
  const { mode } = params;
  
  return {
    title: `${mode === 'live' ? 'Live' : 'Paper'} Trading Overview`,
    description: `View your ${mode} trading account overview, positions, orders, and watchlist.`,
  };
}
