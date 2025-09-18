'use client';
import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error }: { error: Error }) {
  return (
    <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">
      <h3 className="font-semibold text-red-800 mb-2">Une erreur est survenue</h3>
      <p className="text-sm">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Recharger la page
      </button>
    </div>
  );
}

export const WithBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary FallbackComponent={Fallback}>
    {children}
  </ErrorBoundary>
);
