import Link from "next/link";

interface NotFoundProps {
  params: {
    mode: string;
  };
}

export default function ModeNotFound({ params }: NotFoundProps) {
  const { mode } = params || {};
  
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="glass p-8 rounded-2xl text-center max-w-md">
        <h1 className="text-2xl font-semibold text-white mb-4">Page Not Found</h1>
        <p className="text-white/80 mb-6">
          This page doesn't exist or you don't have access to it.
        </p>
        <Link 
          href={`/${mode}/overview`} 
          className="btn-glass inline-block px-6 py-3 text-white hover:bg-white/15 transition-colors"
        >
          Go to Overview
        </Link>
      </div>
    </div>
  );
}
