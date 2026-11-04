import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { managerService } from '../../services/managerService';
import { toast } from 'react-toastify';
import {
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineFilter,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineUser
} from 'react-icons/hi';

export const ManagerCalls = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [execFilter, setExecFilter] = useState('All');
  const [playingId, setPlayingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [calls, setCalls] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const res = await managerService.getCalls({
        search: searchTerm,
        status: statusFilter,
        executive: execFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setCalls(res.data);
        if (res.teamMembers) setTeamMembers(res.teamMembers);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch team calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [searchTerm, statusFilter, execFilter]);

  return (
    <MainLayout title="Branch Team Call Logs & Audio Transcripts">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">Team Call Activity & Telephony Logs</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit live outbound dial attempts, talk durations, notes, and call outcomes made by your sales team.
          </p>
        </div>

        <button
          onClick={fetchCalls}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Calls
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, phone, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none font-bold text-gray-700 bg-white"
          >
            <option value="All">All Call Outcomes</option>
            <option value="Connected">Connected / Answered</option>
            <option value="Missed">Missed / Unanswered</option>
            <option value="Busy">Busy</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={execFilter}
            onChange={(e) => setExecFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none font-bold text-gray-700 bg-white"
          >
            <option value="All">All Executives</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Call Logs Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading team call records...</p>
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlinePhone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Call Logs Found</p>
          <p className="text-xs text-gray-400 mt-1">Outbound dials made by your sales team will be logged here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Sales Executive</th>
                  <th className="py-3.5 px-4">Client Contact</th>
                  <th className="py-3.5 px-4">Direction & Duration</th>
                  <th className="py-3.5 px-4">Call Outcome</th>
                  <th className="py-3.5 px-4">Follow-up Notes / Remarks</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {calls.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black text-xs">
                          {(c.callerName || 'E').charAt(0)}
                        </div>
                        <span className="font-bold text-[#102A2E]">{c.callerName || 'Sales Exec'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{c.clientName}</div>
                      <div className="font-mono text-[10px] text-gray-400">{c.clientPhone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-700">{c.direction || 'Outbound'}</span>
                      <div className="text-[10px] font-mono text-[#0F766E] font-bold">
                        {c.durationSeconds ? `${Math.floor(c.durationSeconds / 60)}m ${c.durationSeconds % 60}s` : '0m 45s'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          c.status === 'Connected'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        ● {c.status || 'Connected'}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-gray-600">
                      {c.notes || 'Interested in plot layout and site visit schedule.'}
                    </td>

                    <td className="py-3 px-4 text-gray-400 text-[11px]">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
