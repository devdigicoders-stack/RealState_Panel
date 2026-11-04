import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { PlotModal } from '../../components/company/PlotModal';
import { Pagination } from '../../components/common/Pagination';
import { ViewToggle } from '../../components/common/ViewToggle';
import { companyAdminService } from '../../services/companyAdminService';
import { salesUserService } from '../../services/salesUserService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineBookmark,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineBan,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineLockClosed
} from 'react-icons/hi';

export const CompanyAdminPlots = () => {
  const { user } = useAuth();
  const isSalesUser = user?.role === 'sales_user';
  const isAgent = user?.role === 'agent';
  const canEditPlotMaster = !isSalesUser && !isAgent;
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPlot, setSelectedPlot] = useState(null);

  const [plots, setPlots] = useState([]);
  const [stats, setStats] = useState({
    totalPlots: 0,
    availablePlots: 0,
    bookedPlots: 0,
    holdPlots: 0,
    registeredPlots: 0
  });

  const loadProjectsDropdown = async () => {
    try {
      const res = await companyAdminService.getProjects();
      if (res.success && Array.isArray(res.data)) {
        setProjectsList(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getPlots({
        projectId: selectedProjectId,
        status: statusFilter,
        search: searchTerm,
        page: 1,
        limit: 100
      });
      if (res.success && Array.isArray(res.data)) {
        setPlots(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load plot matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectsDropdown();
  }, []);

  useEffect(() => {
    fetchPlots();
  }, [selectedProjectId, statusFilter, searchTerm]);

  const handlePlotClick = (plt) => {
    setSelectedPlot(plt);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddPlot = () => {
    setSelectedPlot(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleHoldPlot = (plt) => {
    Swal.fire({
      title: `Hold Request: Plot ${plt.plotNo || plt.plotNumber}`,
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1 text-gray-700">Customer Full Name *</label>
            <input id="hold-cust-name" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="e.g. Ramesh Kumar" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Customer Phone Number *</label>
            <input id="hold-cust-phone" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Remarks / Hold Reason</label>
            <textarea id="hold-remarks" rows="2" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="Client is making token arrangement in 24 hours..."></textarea>
          </div>
          <p class="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            Plot rate: <strong>${plt.total || plt.price || 'Market Rate'}</strong>. Sales users cannot alter master prices.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Hold Request',
      confirmButtonColor: '#0F766E',
      preConfirm: () => {
        const name = document.getElementById('hold-cust-name')?.value;
        const phone = document.getElementById('hold-cust-phone')?.value;
        const remarks = document.getElementById('hold-remarks')?.value;
        if (!name || !phone) {
          Swal.showValidationMessage('Customer Name & Phone are required');
          return false;
        }
        return { name, phone, remarks };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await salesUserService.requestPlotHold(plt._id || plt.id, {
            customerName: result.value.name,
            customerPhone: result.value.phone,
            remarks: result.value.remarks
          });
          if (res.success) {
            toast.success(res.message || 'Plot put on Hold successfully!');
            fetchPlots();
          }
        } catch (err) {
          toast.error(err.message || 'Failed to request plot hold');
        }
      }
    });
  };

  const handleEditPlot = (plt) => {
    setSelectedPlot(plt);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSavePlot = async (plotData) => {
    try {
      if (modalMode === 'edit' && selectedPlot) {
        const id = selectedPlot._id || selectedPlot.id;
        const res = await companyAdminService.updatePlot(id, plotData);
        if (res.success) {
          toast.success(res.message || 'Plot updated successfully!');
          fetchPlots();
        }
      } else {
        const res = await companyAdminService.createPlot({
          ...plotData,
          projectId: selectedProjectId !== 'All' ? selectedProjectId : projectsList[0]?._id
        });
        if (res.success) {
          toast.success(res.message || 'Plot added to matrix!');
          fetchPlots();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plot');
    }
  };

  const handleDeletePlot = (id, plotNo) => {
    Swal.fire({
      title: `Delete Plot: ${plotNo}?`,
      text: 'Are you sure you want to remove this plot from MongoDB matrix?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deletePlot(id);
          if (res.success) {
            toast.info(`Plot "${plotNo}" deleted`);
            fetchPlots();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete plot');
        }
      }
    });
  };

  const filtered = plots.filter(p => {
    const plotNoMatch = (p.plotNo || p.plotNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const blockMatch = (p.block || '').toLowerCase().includes(searchTerm.toLowerCase());
    const facingMatch = (p.facing || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = plotNoMatch || blockMatch || facingMatch;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedPlots = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Interactive Visual Plot Inventory Matrix">
      
      {/* Top Banner Inventory Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Available Plots</span>
            <div className="text-xl font-black text-[#0F766E] mt-0.5">{stats.availablePlots} Units</div>
            <p className="text-[10px] text-emerald-600 font-semibold">Ready for Token</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Booked Units</span>
            <div className="text-xl font-black text-[#102A2E] mt-0.5">{stats.bookedPlots} Units</div>
            <p className="text-[10px] text-gray-500 font-semibold">Advance Token Received</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-[#102A2E] flex items-center justify-center font-bold">
            <HiOutlineBookmark className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Temporary Hold</span>
            <div className="text-xl font-black text-[#D6A84B] mt-0.5">{stats.holdPlots} Units</div>
            <p className="text-[10px] text-amber-600 font-semibold">Customer Hold Locked</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineClock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Registry Done</span>
            <div className="text-xl font-black text-blue-600 mt-0.5">{stats.registeredPlots} Units</div>
            <p className="text-[10px] text-blue-600 font-semibold">Sub-Registrar Deeds</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <HiOutlineLocationMarker className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Plot Inventory Matrix & Availability</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Matrix ({plots.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner oversees live plot matrices, dimensions, base rates, customer reservations, and registry locking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlots}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          {canEditPlotMaster && (
            <button
              onClick={handleAddPlot}
              className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span>Add New Plot</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by plot #, block, facing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
            >
              <option value="All">All Townships</option>
              {projectsList.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Hold">Temporary Hold</option>
              <option value="Registered">Registered</option>
            </select>
          </div>
        </div>

        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live plots matrix...</p>
        </div>
      ) : paginatedPlots.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineLocationMarker className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Plots Found in Matrix</p>
          <p className="text-xs text-gray-400 mt-1">Add plots to start selling or adjust filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Plot # & Block</th>
                  <th className="py-3 px-4">Project Township</th>
                  <th className="py-3 px-4">Size & Dimensions</th>
                  <th className="py-3 px-4">Facing / Spec</th>
                  <th className="py-3 px-4">Rate & Total Value</th>
                  <th className="py-3 px-4">Matrix Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedPlots.map((plt) => (
                  <tr key={plt._id || plt.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#102A2E] bg-gray-100 px-2 py-0.5 rounded-lg border">
                          {plt.plotNo || plt.plotNumber}
                        </span>
                        <span className="font-bold text-gray-500">Block {plt.block || 'A'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-800">{plt.projectName || 'Township'}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{plt.size || `${plt.sizeSqft} sqft`}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{plt.dims || plt.dimensions || '30x40'}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-700">{plt.facing || 'East'}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F766E]">{plt.total}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{plt.rate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        plt.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : plt.status === 'Booked'
                          ? 'bg-gray-200 text-gray-800 border border-gray-300'
                          : plt.status === 'Hold' || plt.status === 'Temporary Hold'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        ● {plt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handlePlotClick(plt)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        {isSalesUser && plt.status === 'Available' && (
                          <button
                            onClick={() => handleHoldPlot(plt)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                            title="Hold Plot for Customer"
                          >
                            Hold
                          </button>
                        )}
                        {canEditPlotMaster && (
                          <>
                            <button
                              onClick={() => handleEditPlot(plt)}
                              className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                              title="Edit Plot"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlot(plt._id || plt.id, plt.plotNo || plt.plotNumber)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                              title="Delete Plot"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / VISUAL MATRIX VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {paginatedPlots.map((plt) => {
            const isAvail = plt.status === 'Available';
            const isBooked = plt.status === 'Booked';
            const isHold = plt.status === 'Hold' || plt.status === 'Temporary Hold';
            return (
              <div
                key={plt._id || plt.id}
                onClick={() => handlePlotClick(plt)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isAvail
                    ? 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-500'
                    : isBooked
                    ? 'bg-gray-100 border-gray-300 opacity-80'
                    : isHold
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-blue-50 border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#102A2E]">{plt.plotNo || plt.plotNumber}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border">
                      {plt.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">{plt.size}</div>
                  <div className="text-[10px] font-bold text-[#0F766E] mt-0.5">{plt.total}</div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200/50 text-[10px] text-gray-400">
                  <span>{plt.facing || 'East'}</span>
                  <span className="hover:text-[#0F766E] font-bold">Details →</span>
                </div>
              </div>
            );
          })}
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

      {/* Plot Modal */}
      <PlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlot}
        plot={selectedPlot}
        mode={modalMode}
      />

    </MainLayout>
  );
};

export default CompanyAdminPlots;
