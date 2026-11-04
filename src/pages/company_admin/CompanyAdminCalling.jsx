import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlinePhone,
  HiOutlinePhoneIncoming,
  HiOutlinePhoneOutgoing,
  HiOutlineSearch,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompanyAdminCalling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [playingId, setPlayingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const [callLogs, setCallLogs] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    connectedCalls: 0,
    connectionRate: '85%'
  });

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getCallLogs({
        search: searchTerm,
        type: typeFilter,
        page: 1,
        limit: 100
      });
      if (res.success && Array.isArray(res.data)) {
        setCallLogs(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, [searchTerm, typeFilter]);

  const toggleAudio = (id) => {
    if (playingId === id) {
      setPlayingId(null);
      toast.info('Audio call playback paused');
    } else {
      setPlayingId(id);
      toast.success('Playing live telephony recording...');
    }
  };

  const handleSimulateCall = () => {
    Swal.fire({
      title: 'Manual Call Record Entry',
      html: `
        <div class="text-left text-xs space-y-3 p-1">
          <label class="block font-bold">Client / Prospect Name *:</label>
          <input id="call-client" class="w-full p-2 border rounded-xl" placeholder="e.g. Alok Nath Mishra" />
          <label class="block font-bold">Phone Number *:</label>
          <input id="call-phone" class="w-full p-2 border rounded-xl" placeholder="+91 99350 44556" />
          <label class="block font-bold">Call Direction:</label>
          <select id="call-dir" class="w-full p-2 border rounded-xl">
            <option value="Outbound">Outbound (Executive to Client)</option>
            <option value="Inbound">Inbound (Client Direct Call)</option>
          </select>
          <label class="block font-bold">Call Status:</label>
          <select id="call-status" class="w-full p-2 border rounded-xl">
            <option value="Connected">Connected / Answered</option>
            <option value="Busy">Busy / Line Busy</option>
            <option value="Missed">Missed / Ring No Answer</option>
          </select>
          <label class="block font-bold">Call Outcome / Discussion Notes:</label>
          <textarea id="call-notes" class="w-full p-2 border rounded-xl" rows="2" placeholder="Summary of conversation, requirement discussed..."></textarea>
        </div>
      `,
      confirmButtonText: 'Log Call',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        const clientName = document.getElementById('call-client')?.value;
        const clientPhone = document.getElementById('call-phone')?.value;
        const direction = document.getElementById('call-dir')?.value;
        const status = document.getElementById('call-status')?.value;
        const notes = document.getElementById('call-notes')?.value;
        if (!clientName || !clientPhone) {
          Swal.showValidationMessage('Client name and phone are required');
          return false;
        }
        return { clientName, clientPhone, direction, status, notes, durationSeconds: 120 };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await companyAdminService.createCallLog(result.value);
          if (res.success) {
            toast.success(res.message || 'Call logged successfully!');
            fetchCallLogs();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to log call');
        }
      }
    });
  };

  const filtered = callLogs.filter(c => {
    const custMatch = (c.customer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const agentMatch = (c.agent || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = custMatch || phoneMatch || agentMatch;
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedLogs = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Integrated Telephony, Cloud PBX & Call Recordings">
      
      {/* Top Banner Telephony Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Calls Processed</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{stats.totalCalls || callLogs.length} Calls</div>
            <p className="text-[10px] text-gray-500 mt-1">Virtual PBX IVR Gateway</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlinePhone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Calls Connected</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{stats.connectedCalls} Answered</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Lead conversations completed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlinePhoneIncoming className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Telephony Pickup Rate</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{stats.connectionRate}</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Verified audio logs</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Telephony CDR & Call Audio Logs</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({callLogs.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner monitors sales team audio recordings, call durations, and customer discussion outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCallLogs}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleSimulateCall}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePhone className="w-4 h-4" />
            <span>Log Call Manually</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, phone, or sales agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Direction:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
          >
            <option value="All">All Calls</option>
            <option value="Outbound">Outbound Only</option>
            <option value="Inbound">Inbound Only</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live telephony records...</p>
        </div>
      ) : paginatedLogs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlinePhone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Call Records Found</p>
          <p className="text-xs text-gray-400 mt-1">Make calls or log manual interactions to see logs here.</p>
        </div>
      ) : (
        /* CDR Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Call Client & Phone</th>
                  <th className="py-3 px-4">Sales Executive</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Status & Duration</th>
                  <th className="py-3 px-4">Discussion Outcome</th>
                  <th className="py-3 px-4 text-center">Recording Audio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedLogs.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#102A2E] text-xs">{c.customer}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{c.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{c.agent}</div>
                      <div className="text-[10px] text-gray-400">{c.time}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 w-max ${
                        c.type === 'Inbound' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {c.type === 'Inbound' ? <HiOutlinePhoneIncoming className="w-3 h-3" /> : <HiOutlinePhoneOutgoing className="w-3 h-3" />}
                        <span>{c.type}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{c.duration}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{c.status}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-gray-600">
                      {c.outcome}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleAudio(c._id || c.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all flex items-center gap-1.5 mx-auto cursor-pointer ${
                          playingId === (c._id || c.id)
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white border border-emerald-200'
                        }`}
                      >
                        {playingId === (c._id || c.id) ? (
                          <>
                            <HiOutlinePause className="w-3.5 h-3.5" /> Pause
                          </>
                        ) : (
                          <>
                            <HiOutlinePlay className="w-3.5 h-3.5" /> Listen
                          </>
                        )}
                      </button>
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

    </MainLayout>
  );
};

export default CompanyAdminCalling;
