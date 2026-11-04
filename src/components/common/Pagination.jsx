import React from 'react';
import { 
  HiChevronLeft, 
  HiChevronRight, 
  HiOutlineChevronDoubleLeft, 
  HiOutlineChevronDoubleRight 
} from 'react-icons/hi';

export const Pagination = ({ 
  currentPage = 1, 
  totalItems = 0, 
  itemsPerPage = 10, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-white border-t border-gray-100 rounded-b-2xl">
      {/* Left: Entries Counter */}
      <div className="text-xs text-gray-500 font-medium">
        Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
        <span className="font-bold text-gray-800">{endItem}</span> of{' '}
        <span className="font-bold text-gray-800">{totalItems}</span> entries
      </div>

      {/* Middle/Right: Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="hidden sm:inline">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="p-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-gray-50 focus:outline-none focus:border-[#0F766E] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First Page"
          >
            <HiOutlineChevronDoubleLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <HiChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-bold text-[#102A2E] px-2.5 py-1 bg-gray-100 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <HiChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Last Page"
          >
            <HiOutlineChevronDoubleRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
