import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { SiteVisitModal } from '../../components/company/SiteVisitModal';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompanyAdminSiteVisits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVisit, setSelectedVisit] = useState(null);

  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    scheduled: 0,
    completed: 0
  });

  const fetchSiteVisits = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getSiteVisits({
        search: searchTerm,
        status: statusFilter,
        page: 1,
        limit: 100
      });
      if (res.success && Array.isArray(res.data)) {
        setVisits(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load site visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteVisits();
  }, [searchTerm, statusFilter]);

  const handleCreateVisit = () => {
    setSelectedVisit(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditVisit = (v) => {
    setSelectedVisit(v);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewVisit = (v) => {
    setSelectedVisit(v);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveVisit = async (vData) => {
    try {
      if (modalMode === 'edit' && selectedVisit) {
        const id = selectedVisit._id || selectedVisit.id;
        const res = await companyAdminService.updateSiteVisit(id, vData);
        if (res.success) {
          toast.success(res.message || 'Site visit updated!');
          fetchSiteVisits();
        }
      } else {
        const res = await companyAdminService.createSiteVisit(vData);
        if (res.success) {
          toast.success(res.message || 'Site visit scheduled successfully!');
          fetchSiteVisits();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save site visit');
    }
  };

  const handleDelete = (id, clientName) => {
    Swal.fire({
      title: `Delete Visit for ${clientName}?`,
      text: 'Are you sure you want to remove this visit record from MongoDB?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deleteSiteVisit(id);
          if (res.success) {
            toast.info(`Visit record for ${clientName} removed`);
            fetchSiteVisits();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete visit');
        }
      }
    });
  };

  const filtered = visits.filter(v => {
    const custMatch = (v.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (v.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const projMatch = (v.project || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = custMatch || phoneMatch || projMatch;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedVisits = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Site Visit Logistics, Cab Dispatch & Field Feedback">
      
      {/* Top Banner Logistics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Field Visits</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{stats.totalVisits || visits.length} Visits</div>
            <p className="text-[10px] text-gray-500 mt-1">Ground prospect inspection</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Scheduled & Upcoming</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{stats.scheduled} Dispatches</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Active cab & field rep</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Visits Completed</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{stats.completed} Verified</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Feedback recorded</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Township Site Visits & Fleet Logistics</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({visits.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner tracks real estate client ground tours, vehicles deployed, drivers, and sales executive feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSiteVisits}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleCreateVisit}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Schedule Site Visit</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client, project, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
          >
            <option value="All">All Visits</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live site visits...</p>
        </div>
      ) : paginatedVisits.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Site Visits Found</p>
          <p className="text-xs text-gray-400 mt-1">Schedule client site tours to see logs here.</p>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client Name & Phone</th>
                  <th className="py-3 px-4">Destination Township</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Vehicle Deployed</th>
                  <th className="py-3 px-4">Sales Executive</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedVisits.map((v) => (
                  <tr key={v._id || v.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#102A2E] text-xs">{v.client}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{v.phone}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-800">{v.project}</td>

                    <td className="py-3 px-4">
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 w-max">
                        <HiOutlineClock className="w-3.5 h-3.5" />
                        <span>{v.scheduledDate}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-700 font-semibold">{v.vehicle}</td>

                    <td className="py-3 px-4 font-semibold text-gray-800">{v.assignedExecutive}</td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        v.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        ● {v.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewVisit(v)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditVisit(v)}
                          className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                          title="Edit Visit"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id || v.id, v.client)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Visit"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Site Visit Modal */}
      <SiteVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVisit}
        visit={selectedVisit}
        mode={modalMode}
      />

    </MainLayout>
  );
};

export default CompanyAdminSiteVisits;
