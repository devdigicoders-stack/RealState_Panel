import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  HiOutlineCube, 
  HiOutlineCheckCircle, 
  HiOutlineLockClosed, 
  HiOutlineSparkles,
  HiOutlineSearch,
  HiOutlineViewList,
  HiOutlineViewGrid,
  HiOutlineAdjustments,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SuperAdminModules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [modules, setModules] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const [modulesRes, plansRes] = await Promise.all([
        superAdminService.getModules(),
        superAdminService.getPlans()
      ]);
      if (modulesRes && modulesRes.success && Array.isArray(modulesRes.data)) {
        setModules(modulesRes.data.map(m => ({
          ...m,
          id: m._id || m.id
        })));
      }
      if (plansRes && plansRes.success && Array.isArray(plansRes.data)) {
        setAvailablePlans(plansRes.data);
      }
    } catch (err) {
      console.error('Failed to load modules:', err);
      toast.error('Failed to fetch platform modules from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const toggleModule = async (id) => {
    const mod = modules.find(m => m.id === id);
    const nextState = !mod.active;
    try {
      await superAdminService.toggleModuleStatus(id, nextState);
      setModules(modules.map(m => m.id === id ? { ...m, active: nextState } : m));
      toast.success(`Module "${mod.name}" is now ${nextState ? 'Active' : 'Disabled'}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to toggle module status');
    }
  };

  const handleEditPlans = (mod) => {
    const plansCheckboxes = availablePlans.length > 0
      ? availablePlans.map((p, idx) => `
          <label class="flex items-center gap-2 cursor-pointer font-semibold">
            <input type="checkbox" id="tier-dyn-${idx}" value="${p.name}" ${mod.plans?.includes(p.name) ? 'checked' : ''} class="w-4 h-4 text-[#0F766E] rounded tier-dyn-checkbox" />
            <span>${p.name} (₹${Number(p.price || 0).toLocaleString('en-IN')}/mo)</span>
          </label>
        `).join('')
      : '<p class="text-xs text-gray-400">No plans configured in database yet.</p>';

    Swal.fire({
      title: `Plan Entitlement: ${mod.name}`,
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <p class="text-gray-500">Configure which subscription tiers include this module:</p>
          <div class="space-y-2">
            ${plansCheckboxes}
          </div>
        </div>
      `,
      confirmButtonText: 'Save Plan Entitlement',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        const checkboxes = document.querySelectorAll('.tier-dyn-checkbox:checked');
        const selected = Array.from(checkboxes).map(cb => cb.value);
        return selected;
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          await superAdminService.updateModulePlans(mod.id, res.value);
          toast.success(`Entitlements updated in MongoDB for ${mod.name}!`);
          fetchModules();
        } catch (err) {
          toast.error(err.message || 'Failed to update plan entitlement');
        }
      }
    });
  };

  const filtered = modules.filter(m =>
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = modules.filter(m => m.active).length;

  return (
    <MainLayout title="Platform Feature Modules">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Available Feature Modules & Entitlements</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live toggle for platform capabilities and plan mapping across all tenant organizations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchModules}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total System Modules</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{modules.length} Capabilities</div>
            <p className="text-[10px] text-gray-500 mt-1">Plug & play architecture</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Enabled Worldwide</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{activeCount} Active</div>
            <p className="text-[10px] text-gray-500 mt-1">Available to subscribed tiers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Gated / Disabled Modules</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{modules.length - activeCount} Gated</div>
            <p className="text-[10px] text-gray-500 mt-1">Locked platform switches</p>
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
              placeholder="Search module name or category..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {filtered.length} modules
          </span>
        </div>

        {/* View: Table vs Cards */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 min-w-[950px]">
                  <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                    <tr>
                      <th className="py-3.5 px-4 whitespace-nowrap">Module Name</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Description</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Entitled Plan Tiers</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Platform Switch</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filtered.length > 0 ? (
                      filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                                <HiOutlineCube className="w-4 h-4" />
                              </div>
                              <span className="font-extrabold text-[#102A2E] text-xs whitespace-nowrap">{m.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 whitespace-nowrap">
                              {m.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-sm truncate whitespace-nowrap text-gray-500">
                            {m.description}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              {m.plans?.map((p, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#0F766E] text-[10px] font-bold border border-emerald-100 whitespace-nowrap">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleModule(m.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                m.active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                              }`}
                            >
                              {m.active ? '● Active Everywhere' : '○ Disabled'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleEditPlans(m)}
                              className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl transition-all text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                            >
                              <HiOutlineAdjustments className="w-3.5 h-3.5" /> Configure Plans
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">
                          No feature modules found matching your search.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                        <HiOutlineCube className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-sm text-[#102A2E]">{m.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                      {m.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">{m.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleModule(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      m.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {m.active ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => handleEditPlans(m)}
                    className="px-3 py-1.5 bg-[#0F766E] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
};
