import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { 
  HiOutlinePhone, 
  HiOutlineCheckCircle, 
  HiOutlineCog, 
  HiOutlineViewList, 
  HiOutlineViewGrid, 
  HiOutlineSearch, 
  HiOutlineShieldCheck, 
  HiOutlineKey,
  HiOutlineRefresh
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const SuperAdminCallingProviders = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getCallingProviders();
      if (res && res.success && Array.isArray(res.data)) {
        setProviders(res.data.map(p => ({
          ...p,
          id: p._id || p.id
        })));
      }
    } catch (err) {
      console.error('Failed to load calling providers:', err);
      toast.error('Failed to load telephony providers from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleEdit = (p) => {
    Swal.fire({
      title: `Configure ${p.name}`,
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1">Provider Master API Key / Token:</label>
            <input id="prov-key" class="w-full p-2 border rounded font-mono text-xs" value="${p.apiKey || ''}" />
          </div>
          <div>
            <label class="block font-bold mb-1">Webhook Callback URL:</label>
            <input id="prov-webhook" class="w-full p-2 border rounded font-mono text-[11px]" value="${p.webhookUrl || 'https://api.crmplatform.com/v1/telephony/callbacks'}" />
          </div>
          <div>
            <label class="block font-bold mb-1">Gateway Status:</label>
            <select id="prov-status" class="w-full p-2 border rounded font-bold text-xs">
              <option value="Operational" ${p.status === 'Operational' ? 'selected' : ''}>Operational (Healthy)</option>
              <option value="Maintenance" ${p.status === 'Maintenance' ? 'selected' : ''}>Maintenance Mode</option>
              <option value="Degraded" ${p.status === 'Degraded' ? 'selected' : ''}>Degraded Latency</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Save Gateway Credentials',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        return {
          apiKey: document.getElementById('prov-key')?.value,
          webhookUrl: document.getElementById('prov-webhook')?.value,
          status: document.getElementById('prov-status')?.value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed && r.value) {
        try {
          await superAdminService.updateCallingProvider(p.id || p._id, r.value);
          toast.success(`${p.name} settings updated in MongoDB!`);
          fetchProviders();
        } catch (err) {
          toast.error(err.message || 'Failed to update gateway settings');
        }
      }
    });
  };

  const filtered = providers.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supportedCompanies || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Telephony & Calling Providers">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Cloud VoIP & Telephony Integrations</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live configuration for Exotel, Tata Tele, Knowlarity & Twilio trunks mapped to tenants in MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProviders}
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
            <div className="text-2xl font-black text-[#102A2E] mt-1">{providers.length} Trunks</div>
            <p className="text-[10px] text-gray-500 mt-1">Multi-tenant SIP infrastructure</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Healthy Gateways</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{providers.filter(p => p.status === 'Operational').length} Active</div>
            <p className="text-[10px] text-gray-500 mt-1">99.98% carrier uptime SLA</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Average Latency</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">&lt; 20ms</div>
            <p className="text-[10px] text-gray-500 mt-1">Low-latency PRI routing</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Call Recording</span>
            <div className="text-2xl font-black text-purple-700 mt-1">Encrypted</div>
            <p className="text-[10px] text-gray-500 mt-1">AWS S3 / GCP Storage bucket</p>
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
              placeholder="Search provider, type or tenant..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {filtered.length} providers
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
                      <th className="py-3.5 px-4 whitespace-nowrap">Carrier / Gateway</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Architecture Type</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Latency SLA</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Supported Companies</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filtered.length > 0 ? (
                      filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                                <HiOutlinePhone className="w-4 h-4" />
                              </div>
                              <span className="font-extrabold text-[#102A2E] text-xs whitespace-nowrap">{p.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-800 text-xs">{p.type}</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                              {p.latency}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                            {p.supportedCompanies}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              p.status === 'Operational'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {p.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(p)}
                              className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl transition-all text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                            >
                              <HiOutlineCog className="w-3.5 h-3.5" /> Configure Credentials
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">
                          No telephony providers found matching your search.
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
            {filtered.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                        <HiOutlinePhone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#102A2E]">{p.name}</h3>
                        <span className="text-[10px] text-gray-400">{p.type}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Carrier Latency:</span>
                      <span className="font-bold text-[#0F766E] font-mono">{p.latency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tenants Supported:</span>
                      <span className="font-bold text-gray-800">{p.supportedCompanies}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(p)}
                  className="mt-5 w-full py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white text-xs font-bold rounded-xl transition-all"
                >
                  Configure Gateway Credentials
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
};
