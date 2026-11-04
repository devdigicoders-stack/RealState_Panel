import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { TeamModal } from '../../components/company/TeamModal';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi';

export const CompanyAdminTeam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isManager = location.pathname.startsWith('/manager');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMember, setSelectedMember] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    try {
      const res = await companyAdminService.getBranches();
      if (res.success && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch branches for assignment:', err);
    }
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getTeamMembers({ 
        search: searchTerm,
        status: statusFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setTeamMembers(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchBranches();
  }, [searchTerm, statusFilter]);

  const handleAddMember = () => {
    setSelectedMember(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditMember = (m) => {
    setSelectedMember(m);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewMember = (m) => {
    const basePath = isManager ? '/manager/team' : '/company_admin/team';
    navigate(`${basePath}/${m._id || m.id}`);
  };

  const handleSaveMember = async (mData) => {
    try {
      if (modalMode === 'edit' && selectedMember) {
        const id = selectedMember._id || selectedMember.id;
        const res = await companyAdminService.updateTeamMember(id, mData);
        if (res.success) {
          toast.success(res.message || 'Team member updated!');
          fetchTeam();
        }
      } else {
        const res = await companyAdminService.createTeamMember(mData);
        if (res.success) {
          toast.success(res.message || 'Team member registered!');
          fetchTeam();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save team member');
    }
  };

  const handleApprovalAction = async (memberId, action) => {
    if (action === 'reject') {
      const { value: reason } = await Swal.fire({
        title: 'Reject Employee Dossier?',
        input: 'textarea',
        inputLabel: 'Rejection Reason (What needs to be corrected/re-uploaded)',
        inputPlaceholder: 'e.g. Identity documents blurred or missing experience letter...',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Confirm Rejection',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) return 'Please specify a reason!';
        }
      });
      if (!reason) return;

      try {
        const res = await companyAdminService.updateTeamMemberApproval(memberId, { action: 'reject', remarks: reason });
        if (res.success) {
          toast.success(res.message);
          fetchTeam();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to reject employee');
      }
      return;
    }

    if (action === 'handover_to_company') {
      const { isConfirmed } = await Swal.fire({
        title: 'Verify & Handover to Company?',
        text: 'Have you verified all documents and credentials? Once handed over, Company Admin will grant final approval and activate login.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0F766E',
        confirmButtonText: 'Yes, Verify & Handover',
        cancelButtonText: 'Cancel'
      });
      if (!isConfirmed) return;

      try {
        const res = await companyAdminService.updateTeamMemberApproval(memberId, { action: 'handover_to_company' });
        if (res.success) {
          toast.success(res.message);
          fetchTeam();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to handover employee');
      }
      return;
    }

    if (action === 'approve') {
      const { isConfirmed } = await Swal.fire({
        title: 'Approve & Enable Login?',
        text: 'This sales user account will be activated and login access will be granted immediately.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0F766E',
        confirmButtonText: 'Yes, Approve & Activate',
        cancelButtonText: 'Cancel'
      });
      if (!isConfirmed) return;

      try {
        const res = await companyAdminService.updateTeamMemberApproval(memberId, { action: 'approve' });
        if (res.success) {
          toast.success(res.message);
          fetchTeam();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to approve employee');
      }
      return;
    }

    if (action === 'suspend') {
      try {
        const res = await companyAdminService.updateTeamMemberApproval(memberId, { action: 'suspend' });
        if (res.success) {
          toast.info(res.message);
          fetchTeam();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to suspend employee');
      }
    }
  };

  const handleDeleteMember = (id, name) => {
    Swal.fire({
      title: `Delete Staff Member: ${name}?`,
      text: 'Are you sure you want to revoke system credentials for this staff member?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Revoke'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deleteTeamMember(id);
          if (res.success) {
            toast.info(`Staff member "${name}" deleted`);
            fetchTeam();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete staff member');
        }
      }
    });
  };

  const filtered = teamMembers.filter(m =>
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedMembers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Sales Team, Telecallers & Role Quota Allocation">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Active Staff Roster</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{teamMembers.length} Members</div>
            <p className="text-[10px] text-gray-500 mt-1">Tenant seat allocation</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Field Telecallers</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">
              {teamMembers.filter(m => m.role?.toLowerCase().includes('exec') || m.role?.toLowerCase().includes('tele')).length} Executives
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Calling & site visit dispatch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlinePhone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Sales Managers</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">
              {teamMembers.filter(m => m.role?.toLowerCase().includes('manager')).length} Managers
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Pipeline team leaders</p>
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
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Company Internal Sales Team</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({teamMembers.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner manages company staff members, grants role permissions, and tracks team lead pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeam}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleAddMember}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by staff name, email, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['All', 'Active', 'Pending', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#102A2E] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live staff roster...</p>
        </div>
      ) : paginatedMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Staff Members Found</p>
          <p className="text-xs text-gray-400 mt-1">Add sales executives or managers to allocate roles.</p>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Assigned Branch & Origin</th>
                  <th className="py-3 px-4">Designation Role</th>
                  <th className="py-3 px-4">Contact Coordinates</th>
                  <th className="py-3 px-4">Allocated Scope</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedMembers.map((m) => (
                  <tr key={m._id || m.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black text-xs">
                          {m.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#102A2E] text-xs">{m.name}</div>
                          <div className="text-[10px] text-gray-400">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#102A2E] text-xs">
                          {m.branchName || 'Not Assigned'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Added by: <strong className="text-[#0F766E]">{m.addedBy || 'Company Admin'}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-900">{m.role}</td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-gray-800">{m.phone}</div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-semibold">{m.teamSize}</td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          m.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : m.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          ● {m.status}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {m.branchName ? `Branch: ${m.branchName}` : 'Head Office'}
                          {m.isReviewedByBranch ? ' • Branch Verified' : ''}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Manager Action: Handover */}
                        {isManager && m.status !== 'Active' && m.handoverStatus !== 'Reviewed & Handed Over' && (
                          <button
                            onClick={() => handleApprovalAction(m._id || m.id, 'handover_to_company')}
                            className="px-2 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1"
                            title="Verify documents and handover to company"
                          >
                            <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Handover
                          </button>
                        )}

                        {/* Company Admin Actions: Approve or Reject */}
                        {!isManager && m.status !== 'Active' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleApprovalAction(m._id || m.id, 'approve')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-0.5"
                              title="Approve & Activate"
                            >
                              <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleApprovalAction(m._id || m.id, 'reject')}
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-bold rounded-lg cursor-pointer border border-red-200"
                              title="Reject KYC"
                            >
                              <HiOutlineXCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleViewMember(m)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMember(m)}
                          className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                          title="Edit Permissions"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m._id || m.id, m.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Revoke Access"
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

      {/* Team Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        member={selectedMember}
        mode={modalMode}
        isManager={isManager}
        branches={branches}
      />

    </MainLayout>
  );
};

export default CompanyAdminTeam;
