import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { salesUserService } from '../../services/salesUserService';
import { toast } from 'react-toastify';
import {
  HiOutlinePhoneIncoming,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SalesUserCalls = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState([]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const res = await salesUserService.getMyCalls({
        search: searchTerm,
        result: resultFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setCalls(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [searchTerm, resultFilter]);

  const filtered = calls;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedCalls = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="My Calling Records & Dispositions">
      <div className="space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#102A2E]">My Calling Logs</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Only your outbound and inbound call dispositions. Manager and Company Admin track these in performance.
            </p>
          </div>
          <button
            onClick={fetchCalls}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer name, phone, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {['All', 'Interested', 'Follow-up Required', 'Site Visit', 'Not Interested', 'No Answer'].map((res) => (
              <button
                key={res}
                onClick={() => setResultFilter(res)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  resultFilter === res
                    ? 'bg-[#102A2E] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-500 mt-3">Loading your calls...</p>
          </div>
        ) : paginatedCalls.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
            <HiOutlinePhoneIncoming className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">No Calls Found</p>
            <p className="text-xs text-gray-400 mt-1">Calls you make to assigned leads will be logged here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Client Phone</th>
                    <th className="py-3.5 px-4">Call Result</th>
                    <th className="py-3.5 px-4">Call Duration</th>
                    <th className="py-3.5 px-4">Detailed Remarks</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {paginatedCalls.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#102A2E]">{c.customerName || c.clientPhone || 'Lead'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{c.clientPhone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          c.callResult === 'Interested'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.callResult === 'Not Interested'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {c.callResult || c.status || 'Connected'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{c.duration || '2m 30s'}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-sm truncate">{c.remarks || 'No remarks'}</td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                        {c.callDate ? new Date(c.callDate).toLocaleString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filtered.length}
          />
        )}

      </div>
    </MainLayout>
  );
};
