import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { LeadModal } from '../../components/company/LeadModal';
import { managerService } from '../../services/managerService';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSwitchHorizontal,
  HiOutlinePhone,
  HiOutlineCheck,
  HiOutlineUserCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineSparkles,
  HiOutlinePencilAlt,
  HiOutlineRefresh
} from 'react-icons/hi';

export const ManagerLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [execFilter, setExecFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Modal State for View & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedLead, setSelectedLead] = useState(null);

  const [leads, setLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await managerService.getLeads({
        search: searchTerm,
        status: statusFilter,
        executive: execFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setLeads(res.data);
        if (res.teamMembers) {
          setTeamMembers(res.teamMembers);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load branch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter, execFilter]);

  const handleAssignSingle = async (lead) => {
    if (!teamMembers || teamMembers.length === 0) {
      toast.warning('No sales executives found in branch team.');
      return;
    }

    const inputOptions = {};
    teamMembers.forEach(m => {
      inputOptions[m._id] = `${m.name} (${m.phone || 'Sales Exec'})`;
    });

    const result = await Swal.fire({
      title: `Assign Lead: ${lead.name || lead.fullName}`,
      text: `Select an executive from your branch team:`,
      input: 'select',
      inputOptions,
      inputPlaceholder: 'Select Sales Executive',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Assign Lead'
    });

    if (result.isConfirmed && result.value) {
      try {
        const res = await managerService.assignLead(lead._id, result.value);
        if (res.success) {
          toast.success(res.message);
          fetchLeads();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to assign lead');
      }
    }
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
        const res = await companyAdminService.updateLead(selectedLead._id || selectedLead.id, leadData);
        if (res.success) {
          toast.success(res.message || 'Lead dossier updated!');
          fetchLeads();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    }
  };

  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const paginatedLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="Branch Leads Allocation & Dispatch">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">Branch Leads Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time allocation of customer inquiries to your branch sales team.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Leads
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, phone, project..."
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
            <option value="All">All Stages</option>
            <option value="New">Fresh / New</option>
            <option value="Contacted">Contacted</option>
            <option value="Site Visit">Site Visit Stage</option>
            <option value="Won">Booked / Won</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={execFilter}
            onChange={(e) => setExecFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none font-bold text-gray-700 bg-white"
          >
            <option value="All">All Executives</option>
            <option value="Unassigned">Unassigned Only</option>
            {teamMembers.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading branch leads from database...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Branch Leads Found</p>
          <p className="text-xs text-gray-400 mt-1">Inquiries for this branch will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Lead Identity</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Requirement / Project</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Assigned Executive</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedLeads.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#102A2E]">{l.name || l.fullName}</div>
                      <div className="font-mono text-[10px] text-gray-400">
                        {l.leadId || `LD-${String(l._id).slice(-4)}`} • {l.source || 'Direct'}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-gray-800">{l.phone}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{l.projectInterested || l.projectName || 'Township Plot'}</div>
                      <div className="text-[10px] text-gray-400">{l.budgetRange || l.budget || '₹30L - ₹60L'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {l.status || 'New'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {l.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#0F766E] flex items-center justify-center font-black text-[10px]">
                            {(l.assignedToName || 'E').charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800">{l.assignedToName || 'Sales Exec'}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ⚠ Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleAssignSingle(l)}
                          className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                          title="Assign to Executive"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleViewLead(l)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer"
                          title="View Dossier"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditLead(l)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer"
                          title="Edit Lead"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
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
      {!loading && leads.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={leads.length}
        />
      )}

      {/* Lead Modal */}
      {isModalOpen && (
        <LeadModal
          isOpen={isModalOpen}
          mode={modalMode}
          lead={selectedLead}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLead}
        />
      )}
    </MainLayout>
  );
};
