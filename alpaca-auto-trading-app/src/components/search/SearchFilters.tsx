'use client';
import { useState } from 'react';

type FilterOptions = {
  type: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minVolume: number | null;
  minChange: number | null;
  maxChange: number | null;
  esgGrade: string[];
};

type Props = {
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export default function SearchFilters({ onFiltersChange, isOpen, onToggle }: Props) {
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    minPrice: null,
    maxPrice: null,
    minVolume: null,
    minChange: null,
    maxChange: null,
    esgGrade: []
  });

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      type: [],
      minPrice: null,
      maxPrice: null,
      minVolume: null,
      minChange: null,
      maxChange: null,
      esgGrade: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== null
  );

  return (
    <div className="ds-card p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filtres</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Effacer tout
            </button>
          )}
          <button 
            onClick={onToggle}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {isOpen ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Type d'actif</label>
            <div className="flex flex-wrap gap-1">
              {['stock', 'etf', 'crypto', 'index'].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const newTypes = filters.type.includes(type)
                      ? filters.type.filter(t => t !== type)
                      : [...filters.type, type];
                    updateFilter('type', newTypes);
                  }}
                  className={`badge ${filters.type.includes(type) ? 'bg-blue-600 text-white' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Prix</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={e => updateFilter('minPrice', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded"
              />
            </div>
          </div>

          {/* Volume Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Volume minimum</label>
            <input
              type="number"
              placeholder="Volume"
              value={filters.minVolume || ''}
              onChange={e => updateFilter('minVolume', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          {/* Change Range */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Variation (%)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min %"
                value={filters.minChange || ''}
                onChange={e => updateFilter('minChange', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded"
              />
              <input
                type="number"
                placeholder="Max %"
                value={filters.maxChange || ''}
                onChange={e => updateFilter('maxChange', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded"
              />
            </div>
          </div>

          {/* ESG Grade */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Note ESG</label>
            <div className="flex flex-wrap gap-1">
              {['A', 'B', 'C', 'D', 'F'].map(grade => (
                <button
                  key={grade}
                  onClick={() => {
                    const newGrades = filters.esgGrade.includes(grade)
                      ? filters.esgGrade.filter(g => g !== grade)
                      : [...filters.esgGrade, grade];
                    updateFilter('esgGrade', newGrades);
                  }}
                  className={`badge ${filters.esgGrade.includes(grade) ? 'bg-green-600 text-white' : ''}`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
