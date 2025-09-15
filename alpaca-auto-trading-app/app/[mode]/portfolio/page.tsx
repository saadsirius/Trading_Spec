import { notFound } from "next/navigation";
import { PortfolioDetail } from "../../(trading)/components/PortfolioDetail";

interface PortfolioModePageProps {
  params: {
    mode: string;
  };
}

export default function PortfolioModePage({ params }: PortfolioModePageProps) {
  // Handle case where params might be undefined during static generation
  if (!params) {
    return <div>Loading...</div>;
  }
  
  const { mode } = params;
  
  // Validate mode parameter
  if (mode !== 'paper' && mode !== 'live') {
    notFound();
  }

  return <PortfolioDetail mode={mode as 'paper' | 'live'} />;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
