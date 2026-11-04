import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { 
  HiOutlineChatAlt2, 
  HiOutlineCheckCircle, 
  HiOutlineViewList, 
  HiOutlineViewGrid,
  HiOutlineSearch,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineRefresh
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const SuperAdminMessagingIntegrations = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [gateways, setGateways] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGateways = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getMessagingGateways();
      if (res && res.success && Array.isArray(res.data)) {
        setGateways(res.data.map(g => ({
          ...g,
          id: g._id || g.id
        })));
      }
    } catch (err) {
      console.error('Failed to load gateways:', err);
      toast.error('Failed to load messaging gateways from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleConfig = (g) => {
    Swal.fire({
      title: `Configure ${g.name}`,
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1">TRAI DLT Entity ID / Auth Token:</label>
            <input id="g-dlt" class="w-full p-2 border rounded font-mono text-xs" value="${g.dltEntityId || ''}" />
          </div>
          <div>
            <label class="block font-bold mb-1">Sender ID / WhatsApp Header:</label>
            <input id="g-sender" class="w-full p-2 border rounded font-mono text-xs" value="${g.senderId || ''}" />
          </div>
          <div>
            <label class="block font-bold mb-1">Gateway Status:</label>
            <select id="g-status" class="w-full p-2 border rounded font-bold text-xs">
              <option value="Connected" ${g.status === 'Connected' ? 'selected' : ''}>Connected (Active)</option>
              <option value="Degraded" ${g.status === 'Degraded' ? 'selected' : ''}>Degraded Latency</option>
              <option value="Disabled" ${g.status === 'Disabled' ? 'selected' : ''}>Disabled</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Update Gateway',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        return {
          dltEntityId: document.getElementById('g-dlt')?.value,
          senderId: document.getElementById('g-sender')?.value,
          status: document.getElementById('g-status')?.value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed && r.value) {
        try {
          await superAdminService.updateMessagingGateway(g.id || g._id, r.value);
          toast.success(`${g.name} parameters saved in MongoDB!`);
          fetchGateways();
        } catch (err) {
          toast.error(err.message || 'Failed to update gateway');
        }
      }
    });
  };

  const filtered = gateways.filter(g => 
    (g.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.channel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.senderId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="WhatsApp & Messaging Integrations">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">WhatsApp & SMS Gateway Trunks</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live messaging routers for automated payment reminders, site visits, and brochure pushes in MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchGateways}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Reload from MongoDB"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
            </button>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-[#0F766E] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Table View"
              >
                <HiOutlineViewList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'cards' ? 'bg-white text-[#0F766E] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid Cards View"
              >
                <HiOutlineViewGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Banner Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Configured Gateways</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{gateways.length} Channels</div>
            <p className="text-[10px] text-gray-500 mt-1">Multi-tenant messaging</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">DLT Entity Enforced</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">100% Compliant</div>
            <p className="text-[10px] text-gray-500 mt-1">TRAI verified headers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Throughput Speed</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">&lt; 250ms</div>
            <p className="text-[10px] text-gray-500 mt-1">Direct Meta cloud routing</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Channel Security</span>
            <div className="text-2xl font-black text-purple-700 mt-1">Encrypted</div>
            <p className="text-[10px] text-gray-500 mt-1">TLS 1.3 / Meta Webhook</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search gateway, channel or header..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {filtered.length} gateways
          </span>
        </div>

        {/* View: Table vs Cards */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={4} columns={6} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 min-w-[950px]">
                  <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                    <tr>
                      <th className="py-3.5 px-4 whitespace-nowrap">Gateway Channel</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Protocol & Type</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">DLT Entity / Header ID</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Latency SLA</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filtered.length > 0 ? (
                      filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((g) => (
                        <tr key={g.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                                <HiOutlineChatAlt2 className="w-4 h-4" />
                              </div>
                              <span className="font-extrabold text-[#102A2E] text-xs whitespace-nowrap">{g.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-800 text-xs">{g.channel}</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-mono text-gray-900 font-bold block text-xs">{g.senderId}</span>
                              <span className="font-mono text-gray-400 text-[10px] block">DLT: {g.dltEntityId}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                              {g.latency}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              g.status === 'Connected'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${g.status === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {g.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleConfig(g)}
                              className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl transition-all text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                            >
                              <HiOutlineCog className="w-3.5 h-3.5" /> Configure Gateway
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">
                          No messaging gateways found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        ) : (
          /* Cards View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((g) => (
              <div key={g.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                        <HiOutlineChatAlt2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#102A2E]">{g.name}</h3>
                        <span className="text-[10px] text-gray-400">{g.channel}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {g.status}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sender Header:</span>
                      <span className="font-bold text-gray-800 font-mono">{g.senderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TRAI DLT Entity:</span>
                      <span className="font-bold text-gray-800 font-mono">{g.dltEntityId}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleConfig(g)}
                  className="mt-5 w-full py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white text-xs font-bold rounded-xl transition-all"
                >
                  Configure Gateway
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
};
