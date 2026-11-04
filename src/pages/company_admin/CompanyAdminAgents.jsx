import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { AgentModal } from '../../components/company/AgentModal';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineCash,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDocumentText
} from 'react-icons/hi';

export const CompanyAdminAgents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [agents, setAgents] = useState([]);
  const [branches, setBranches] = useState([]);
  const isManager = location.pathname.startsWith('/manager');

  const fetchBranches = async () => {
    try {
      const res = await companyAdminService.getBranches();
      if (res.success && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch branches for broker assignment:', err);
    }
  };
  const [stats, setStats] = useState({
    totalBrokers: 0,
    pendingApprovals: 0,
    activePartners: 0,
    standardSlab: '2.5% Slab',
    totalSalesVolume: '₹0',
    activePipelineCount: 0
  });

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getAgents({
        search: searchTerm,
        status: statusFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setAgents(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load channel partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchBranches();
  }, [searchTerm, statusFilter]);

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewAgent = (agent) => {
    const basePath = location.pathname.startsWith('/manager') ? '/manager' : '/company_admin';
    navigate(`${basePath}/agents/${agent._id || agent.id}`);
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveAgent = async (aData) => {
    try {
      if (modalMode === 'edit' && selectedAgent) {
        const res = await companyAdminService.updateAgent(selectedAgent._id || selectedAgent.id, aData);
        if (res.success) {
          setIsModalOpen(false);
          toast.success(res.message || 'Channel partner dossier updated!');
          await fetchAgents();
        }
      } else {
        const res = await companyAdminService.createAgent(aData);
        if (res.success) {
          setIsModalOpen(false);
          toast.success(res.message || 'Channel partner registered! Pending document approval.');
          await fetchAgents();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save channel partner');
    }
  };

  const handleApproveReject = async (agentId, action) => {
    Swal.fire({
      title: action === 'approve' ? 'Approve Agent & Documents?' : 'Reject KYC Documents?',
      text:
        action === 'approve'
          ? 'Agent documents will be marked Verified, account set to Active, and login access will be enabled!'
          : 'Agent KYC will be marked Rejected and login access will be blocked.',
      icon: action === 'approve' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approve' ? '#0F766E' : '#d33',
      confirmButtonText: action === 'approve' ? 'Yes, Approve & Enable Login' : 'Yes, Reject KYC',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await companyAdminService.updateAgentApproval(agentId, { action });
          if (res.success) {
            toast.success(res.message);
            setIsModalOpen(false);
            fetchAgents();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to process approval');
        }
      }
    });
  };

  const handleDeleteAgent = (agent) => {
    Swal.fire({
      title: `Delete ${agent.fullName || agent.firmName}?`,
      text: 'This will remove the channel partner dossier and deactivate any login user account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await companyAdminService.deleteAgent(agent._id || agent.id);
          if (res.success) {
            toast.success('Channel partner removed successfully');
            fetchAgents();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete agent');
        }
      }
    });
  };

  const filtered = agents.filter(
    (a) =>
      (a.firmName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.agentCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedAgents = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="Channel Partners, Brokers & CP Commission">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Registered Brokers</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{stats.totalBrokers || agents.length} Firms</div>
            <p className="text-[10px] text-gray-500 mt-1">Total channel network</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase">Pending KYC Reviews</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingApprovals || 0} Agents</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Requires document preview</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HiOutlineShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Active & Approved</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{stats.activePartners || 0} Active</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Login enabled partners</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Standard Slab</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{stats.standardSlab || '2.5% Slab'}</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Tiered partner payout</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineCash className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Channel Partner (CP) Broker Network</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({agents.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Preview submitted KYC documents, verify identity & approve partners before granting login access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAgents}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleCreateAgent}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add New Agent / Broker</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, firm, name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['All', 'Pending Verification', 'Active', 'Rejected'].map((st) => (
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
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live broker partners...</p>
        </div>
      ) : paginatedAgents.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Channel Partners Found</p>
          <p className="text-xs text-gray-400 mt-1">Register broker firms to start receiving external leads.</p>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Agent Code & Details</th>
                  <th className="py-3.5 px-4">Assigned Branch & Origin</th>
                  <th className="py-3.5 px-4">Contact Phone & City</th>
                  <th className="py-3.5 px-4">Commission Slab</th>
                  <th className="py-3.5 px-4">KYC / Approval Status</th>
                  <th className="py-3.5 px-4">Login Access</th>
                  <th className="py-3.5 px-4 text-center">Actions & Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedAgents.map((a) => (
                  <tr key={a._id || a.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            a.profilePhoto ||
                            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={a.fullName}
                          className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-[#0F766E] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {a.agentCode || 'CP-NEW'}
                            </span>
                            <span className="font-extrabold text-[#102A2E] text-xs">
                              {a.fullName || a.firmName}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {a.agencyName ? `${a.agencyName} • ` : ''}
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#102A2E] text-xs">
                          {a.branchName || 'Not Assigned'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Added by: <strong className="text-[#0F766E]">{a.addedBy || 'Company Admin'}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-gray-800">{a.phone}</div>
                      <div className="text-[10px] text-gray-400">{a.city || 'Lucknow'}, {a.state || 'UP'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {a.commissionTier || a.commissionRate || '2.5%'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          const isCurrentlyActive = a.status === 'Active';
                          const action = isCurrentlyActive ? 'suspend' : 'approve';
                          Swal.fire({
                            title: `${isCurrentlyActive ? 'Deactivate' : 'Activate'} Broker?`,
                            text: isCurrentlyActive
                              ? `Are you sure you want to suspend "${a.fullName || a.firmName}"? Their login access will be blocked.`
                              : `Are you sure you want to activate "${a.fullName || a.firmName}"? Their login access will be enabled.`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: isCurrentlyActive ? '#d33' : '#0F766E',
                            confirmButtonText: isCurrentlyActive ? 'Yes, Deactivate' : 'Yes, Activate & Enable Login',
                            cancelButtonText: 'Cancel'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleApproveReject(a._id || a.id, action);
                            }
                          });
                        }}
                        title="Click to toggle Active / Inactive"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105 ${
                          a.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                            : a.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                        }`}
                      >
                        ● {a.status || 'Pending Verification'}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      {a.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          🔒 Blocked
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewAgent(a)}
                          className="px-2.5 py-1 bg-[#102A2E] hover:bg-[#0F766E] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Preview Documents & Verify"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>

                        <button
                          onClick={() => handleEditAgent(a)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#0F766E] rounded-lg transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteAgent(a)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Agent"
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

      {/* Agent Modal (8-Step Comprehensive Dossier) */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAgent}
        onApproveReject={handleApproveReject}
        agent={selectedAgent}
        mode={modalMode}
        isManager={isManager}
        branches={branches}
      />
    </MainLayout>
  );
};

export default CompanyAdminAgents;
