import React from 'react';
import { HiOutlineTable, HiOutlineViewGrid } from 'react-icons/hi';

export const ViewToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => onViewModeChange('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          viewMode === 'table'
            ? 'bg-white text-[#102A2E] shadow-2xs'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <HiOutlineTable className="w-3.5 h-3.5" />
        <span>Table</span>
      </button>

      <button
        type="button"
        onClick={() => onViewModeChange('card')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          viewMode === 'card'
            ? 'bg-white text-[#102A2E] shadow-2xs'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <HiOutlineViewGrid className="w-3.5 h-3.5" />
        <span>Cards</span>
      </button>
    </div>
  );
};
