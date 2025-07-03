import React from 'react';

export default function GridListToggle({ view, setView }: { view: 'grid' | 'list'; setView: (v: 'grid' | 'list') => void }) {
  return (
    <div className="flex gap-2 mb-2" role="group" aria-label="View toggle">
      <button
        className={`px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-blue-400 ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => setView('grid')}
        aria-pressed={view === 'grid'}
        aria-label="Grid view"
        tabIndex={0}
      >
        🟦 Grid
      </button>
      <button
        className={`px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-blue-400 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => setView('list')}
        aria-pressed={view === 'list'}
        aria-label="List view"
        tabIndex={0}
      >
        📋 List
      </button>
    </div>
  );
}
