import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { LeadModal } from '../../components/company/LeadModal';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineUserCircle,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompanyAdminLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedLead, setSelectedLead] = useState(null);

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    siteVisitsScheduled: 0,
    tokensPaid: 0
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getLeads({
        search: searchTerm,
        source: sourceFilter,
        stage: stageFilter,
        page: 1,
        limit: 100
      });
      if (res.success && Array.isArray(res.data)) {
        setLeads(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load leads from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, sourceFilter, stageFilter]);

  const handleAddLead = () => {
    setSelectedLead(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveLead = async (leadData) => {
    try {
      if (modalMode === 'edit' && selectedLead) {
        const id = selectedLead._id || selectedLead.id;
        const res = await companyAdminService.updateLead(id, leadData);
        if (res.success) {
          toast.success(res.message || 'Lead updated successfully!');
          fetchLeads();
        }
      } else {
        const res = await companyAdminService.createLead(leadData);
        if (res.success) {
          toast.success(res.message || 'Lead registered and pipeline refreshed!');
          fetchLeads();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleDeleteLead = (id, name) => {
    Swal.fire({
      title: `Delete Lead: ${name}?`,
      text: 'Are you sure you want to remove this prospective lead from MongoDB pipeline?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deleteLead(id);
          if (res.success) {
            toast.info(`Lead "${name}" removed`);
            fetchLeads();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete lead');
        }
      }
    });
  };

  const filtered = leads.filter(l => {
    const nameMatch = (l.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (l.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const projMatch = (l.projectName || l.preferredProject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || phoneMatch || projMatch;
    const matchesSource = sourceFilter === 'All' || l.source === sourceFilter;
    const matchesStage = stageFilter === 'All' || l.stage === stageFilter;
    return matchesSearch && matchesSource && matchesStage;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedLeads = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Company Leads Pipeline & Telephony Routing">
      
      {/* Top Banner Pipeline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Active Leads Pipeline</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{stats.totalLeads || leads.length} Inquiries</div>
            <p className="text-[10px] text-blue-600 font-semibold mt-1">Multi-source Acquisition</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HiOutlineUsers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Site Visits Scheduled</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{stats.siteVisitsScheduled} Verified</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Cab & Driver Dispatches</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center">
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Token Paid Prospects</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{stats.tokensPaid} Hot Leads</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Ready for Registry Approval</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center">
            <HiOutlineCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Leads Central Pipeline</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({leads.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner monitors all incoming inquiries, auto-assigns leads to sales staff, and tracks conversion velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleAddLead}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, mobile, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
            >
              <option value="All">All Sources</option>
              <option value="Website Direct">Website Direct</option>
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Broker / Channel Partner">Broker / Channel Partner</option>
              <option value="Office Walk-in">Office Walk-in</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
            >
              <option value="All">All Stages</option>
              <option value="New Inquiry">New Inquiry</option>
              <option value="New Leads">New Leads</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Site Visit Scheduled">Site Visit Scheduled</option>
              <option value="Site Visit Done">Site Visit Done</option>
              <option value="Token Paid / Booking Pending">Token Paid / Booking Pending</option>
              <option value="Token Booking">Token Booking</option>
              <option value="Sale Registered">Sale Registered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live leads from database...</p>
        </div>
      ) : paginatedLeads.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Leads Found</p>
          <p className="text-xs text-gray-400 mt-1">Register a new lead inquiry to begin tracking pipeline.</p>
        </div>
      ) : (
        /* Leads Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lead Client</th>
                  <th className="py-3 px-4">Assigned Branch & Origin</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Target Project & Requirement</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Assigned Sales Exec</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedLeads.map((l) => (
                  <tr key={l._id || l.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#102A2E] text-xs flex items-center gap-2">
                        <span>{l.name}</span>
                        <span className="font-mono text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
                          {l.leadId || (l._id ? l._id.substring(l._id.length - 6).toUpperCase() : 'LD')}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Budget: <strong className="text-gray-700">{l.budget || '₹30-50L'}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#102A2E] text-xs">
                          {l.branchName || l.assignedBranch || 'Head Office'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Added by: <strong className="text-[#0F766E]">{l.addedBy || l.createdBy || 'Company Admin'}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0F766E] flex items-center gap-1">
                        <HiOutlinePhone className="w-3.5 h-3.5" />
                        <span>{l.phone}</span>
                      </div>
                      {l.email && <div className="text-[10px] text-gray-400 mt-0.5">{l.email}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{l.projectName || l.preferredProject || 'Township'}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{l.requirement || 'Standard Plot'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold border">
                        {l.source}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black text-[10px]">
                          {(l.assignedToName || l.assignedTo || 'ST').substring(0, 1)}
                        </div>
                        <span className="font-bold text-gray-800">{l.assignedToName || l.assignedTo || 'Sales Team'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        (l.stage || '').includes('Token') || (l.stage || '').includes('Sale')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : (l.stage || '').includes('Site Visit')
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : (l.stage || '').includes('Interested')
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        ● {l.stage}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewLead(l)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Lead Dossier"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditLead(l)}
                          className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                          title="Edit Lead"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(l._id || l.id, l.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Lead"
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

      {/* Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        lead={selectedLead}
        mode={modalMode}
      />

    </MainLayout>
  );
};

export default CompanyAdminLeads;
