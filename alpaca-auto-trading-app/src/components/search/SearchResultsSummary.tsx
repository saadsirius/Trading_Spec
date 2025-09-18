'use client';

type Props = {
  query: string;
  results: any[];
  loading: boolean;
  filters?: any;
};

export default function SearchResultsSummary({ query, results, loading, filters }: Props) {
  if (!query && !loading) return null;

  const getFilterSummary = () => {
    if (!filters) return null;
    
    const activeFilters = [];
    if (filters.type?.length > 0) activeFilters.push(`Type: ${filters.type.join(', ')}`);
    if (filters.minPrice || filters.maxPrice) {
      const range = [];
      if (filters.minPrice) range.push(`≥$${filters.minPrice}`);
      if (filters.maxPrice) range.push(`≤$${filters.maxPrice}`);
      activeFilters.push(`Prix: ${range.join(' - ')}`);
    }
    if (filters.minVolume) activeFilters.push(`Volume ≥${filters.minVolume.toLocaleString()}`);
    if (filters.minChange || filters.maxChange) {
      const range = [];
      if (filters.minChange) range.push(`≥${filters.minChange}%`);
      if (filters.maxChange) range.push(`≤${filters.maxChange}%`);
      activeFilters.push(`Variation: ${range.join(' - ')}`);
    }
    if (filters.esgGrade?.length > 0) activeFilters.push(`ESG: ${filters.esgGrade.join(', ')}`);
    
    return activeFilters.length > 0 ? activeFilters.join(' • ') : null;
  };

  const getResultsStats = () => {
    if (!results.length) return null;
    
    const stats = {
      total: results.length,
      positive: results.filter(r => (r.change1d || 0) > 0).length,
      negative: results.filter(r => (r.change1d || 0) < 0).length,
      avgChange: results.reduce((sum, r) => sum + (r.change1d || 0), 0) / results.length,
      topGainer: results.reduce((max, r) => (r.change1d || 0) > (max.change1d || 0) ? r : max, results[0]),
      topLoser: results.reduce((min, r) => (r.change1d || 0) < (min.change1d || 0) ? r : min, results[0])
    };
    
    return stats;
  };

  const stats = getResultsStats();
  const filterSummary = getFilterSummary();

  return (
    <div className="ds-card p-3">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-400">Recherche en cours...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {query ? `Résultats pour "${query}"` : 'Résultats de recherche'}
            </h3>
            {stats && (
              <span className="text-xs text-gray-400">
                {stats.total} résultat{stats.total > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {filterSummary && (
            <div className="text-xs text-gray-400">
              Filtres: {filterSummary}
            </div>
          )}
          
          {stats && stats.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-gray-400">Positifs</div>
                <div className="text-emerald-400 font-semibold">{stats.positive}</div>
              </div>
              <div>
                <div className="text-gray-400">Négatifs</div>
                <div className="text-rose-400 font-semibold">{stats.negative}</div>
              </div>
              <div>
                <div className="text-gray-400">Moyenne</div>
                <div className={`font-semibold ${stats.avgChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(stats.avgChange * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-gray-400">Meilleur</div>
                <div className="text-emerald-400 font-semibold">
                  {stats.topGainer.symbol} +{((stats.topGainer.change1d || 0) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
          
          {stats && stats.total === 0 && query && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-400 mb-2">Aucun résultat trouvé</div>
              <div className="text-xs text-gray-500">
                Essayez de modifier vos critères de recherche ou vos filtres
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
