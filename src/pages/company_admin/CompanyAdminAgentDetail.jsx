import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { companyAdminService } from '../../services/companyAdminService';
import { AgentModal } from '../../components/company/AgentModal';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePencilAlt,
  HiOutlineRefresh,
  HiOutlineClipboardList,
  HiOutlineCurrencyRupee,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineCreditCard
} from 'react-icons/hi';

export const CompanyAdminAgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isManagerPath = location.pathname.startsWith('/manager');
  const returnPath = isManagerPath ? '/manager/agents' : '/company_admin/agents';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc', 'leads', 'bookings', 'payout'

  // Modal for quick edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);

  const fetchAgentDetail = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getAgentDetail(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error('Channel partner not found');
        navigate(returnPath);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch agent details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAgentDetail();
    }
  }, [id]);

  const formatINR = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleApprovalAction = async (action) => {
    try {
      if (action === 'reject') {
        const { value: reason } = await Swal.fire({
          title: 'Reject Agent KYC?',
          input: 'textarea',
          inputLabel: 'Rejection Reason (What needs to be corrected/re-uploaded)',
          inputPlaceholder: 'e.g. PAN card document is blurred, Cheque name does not match...',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Confirm Rejection',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value) {
              return 'You need to write a rejection reason!';
            }
          }
        });

        if (!reason) return;

        const res = await companyAdminService.updateAgentApproval(id, { action: 'reject', remarks: reason });
        if (res.success) {
          toast.success(res.message);
          fetchAgentDetail();
        }
        return;
      }

      if (action === 'handover_to_company') {
        const { isConfirmed } = await Swal.fire({
          title: 'Verify Documents & Handover to Company?',
          text: 'Have you verified all KYC documents (PAN, Aadhaar, Bank details)? Once handed over, Company Admin will do final approval and activate the agent login.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#0F766E',
          confirmButtonText: 'Yes, Verify & Handover',
          cancelButtonText: 'Cancel'
        });

        if (!isConfirmed) return;

        const res = await companyAdminService.updateAgentApproval(id, {
          action: 'handover_to_company',
          remarks: 'Branch Manager verified documents and handed over.'
        });
        if (res.success) {
          toast.success(res.message);
          fetchAgentDetail();
        }
        return;
      }

      const res = await companyAdminService.updateAgentApproval(id, { action });
      if (res.success) {
        toast.success(res.message);
        fetchAgentDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update partner approval');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-4">Loading Channel Partner Dossier & Activity...</p>
        </div>
      </MainLayout>
    );
  }

  const { agent, user, stats, leads = [], bookings = [] } = data || {};

  return (
    <MainLayout>
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(returnPath)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#0F766E] hover:border-[#0F766E] transition-all shadow-xs cursor-pointer"
            title="Back to Agents"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {agent?.agentCode || 'CP-000'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">{agent?.fullName}</h1>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  agent?.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : agent?.status === 'Rejected'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                ● {agent?.status || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{agent?.agencyName ? `${agent.agencyName} • ` : ''}</span>
              <span>{agent?.agentType || 'Individual Broker'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                {agent?.city}, {agent?.state}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            onClick={fetchAgentDetail}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Refresh Activity"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePencilAlt className="w-4 h-4 text-[#0F766E]" /> {agent?.status === 'Rejected' ? 'Re-upload / Edit Docs' : 'Edit Dossier'}
          </button>

          {/* Workflow Actions: Role-based */}
          {isManagerPath ? (
            // BRANCH MANAGER VIEW: Can only Verify & Handover to Company (cannot directly activate)
            agent?.handoverStatus === 'Reviewed & Handed Over' ? (
              <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-blue-600" /> Handed Over to Company
              </span>
            ) : agent?.status === 'Active' ? (
              <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Active (Company Approved)
              </span>
            ) : (
              <button
                onClick={() => handleApprovalAction('handover_to_company')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#115E59] text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <HiOutlineShieldCheck className="w-4 h-4" /> Verify & Handover to Company
              </button>
            )
          ) : (
            // COMPANY ADMIN VIEW: Full Final Decision (Approve, Reject, Suspend)
            agent?.status !== 'Active' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprovalAction('approve')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" /> Company Approve & Activate
                </button>
                <button
                  onClick={() => handleApprovalAction('reject')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <HiOutlineXCircle className="w-4 h-4" /> Reject KYC
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleApprovalAction('suspend')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <HiOutlineXCircle className="w-4 h-4" /> Suspend Account
              </button>
            )
          )}
        </div>
      </div>

      {/* Handover & Branch Audit Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              agent?.handoverStatus === 'Company Approved'
                ? 'bg-emerald-50 text-emerald-700'
                : agent?.handoverStatus === 'Reviewed & Handed Over'
                ? 'bg-blue-50 text-blue-700'
                : agent?.handoverStatus === 'Company Rejected'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              <HiOutlineShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#102A2E] text-sm">
                  {agent?.handoverStatus === 'Company Approved'
                    ? 'Company Verified & Approved'
                    : agent?.handoverStatus === 'Reviewed & Handed Over'
                    ? 'Branch Verified & Handed Over to Company'
                    : agent?.handoverStatus === 'Company Rejected'
                    ? 'Rejected by Company'
                    : 'Branch Verification Pending'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  agent?.isReviewedByBranch ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {agent?.isReviewedByBranch ? 'Branch Review: Done' : 'Branch Review: Not Done'}
                </span>
              </div>
              <p className="text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-700">Origin: </span>
                {agent?.branchName ? `Branch: ${agent.branchName}` : 'Company Direct'}
                {agent?.createdByUserName && ` • Created by: ${agent.createdByUserName}`}
                {agent?.branchReviewedByName && ` • Reviewed by: ${agent.branchReviewedByName}`}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-gray-400">Current Login Status: </span>
            <span className={`font-bold ${agent?.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
              {agent?.status === 'Active' ? 'Login Enabled' : 'Login Blocked (Requires Approval)'}
            </span>
            {agent?.companyRejectionReason && (
              <p className="text-red-600 font-medium text-[11px] mt-0.5 bg-red-50 px-2 py-1 rounded border border-red-200">
                Reason: {agent.companyRejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards: Track Leads, Bookings, Sales Volume, Commission */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Referred Bookings</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <HiOutlineShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.totalBookings || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-purple-600 font-bold">{leads.length}</span> Total Leads Registered
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Sales Volume</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <HiOutlineCurrencyRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">
            {formatINR(stats?.totalSalesVolume || 0)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Commission Rate: <span className="font-bold text-[#0F766E]">{agent?.commissionTier || agent?.commissionRate || '2.5%'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Commission</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0F766E]">
              <HiOutlineCurrencyRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0F766E]">
            {formatINR(stats?.totalCommissionEarned || 0)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Earned on closed plot deals
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Pending Payout</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <HiOutlineCreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {formatINR(stats?.pendingCommission || 0)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Paid: {formatINR(stats?.paidCommission || 0)}
          </div>
        </div>
      </div>

      {/* Partner Profile Strip */}
      <div className="bg-gradient-to-r from-[#102A2E] to-[#0F766E] rounded-3xl p-5 sm:p-6 text-white mb-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={agent?.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'}
              alt={agent?.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Channel Partner Dossier
              </div>
              <h2 className="text-lg font-black">{agent?.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <HiOutlinePhone className="w-3.5 h-3.5 text-emerald-300" />
                  {agent?.phone}
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineMail className="w-3.5 h-3.5 text-emerald-300" />
                  {agent?.loginEmail || agent?.email}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  Login: {agent?.status === 'Active' ? 'Active' : 'Restricted'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs flex flex-col gap-1 min-w-[220px]">
            <div className="flex justify-between">
              <span className="text-white/60">KYC Status:</span>
              <span className="font-bold text-emerald-300">{agent?.kycStatus || 'Submitted'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">PAN:</span>
              <span className="font-mono font-bold uppercase">{agent?.panNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Commission Slab:</span>
              <span className="font-bold">{agent?.commissionTier || '2.5%'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'kyc'
                ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineDocumentText className="w-4 h-4" />
            <span>KYC Documents & Bank Details</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineShieldCheck className="w-4 h-4" />
            <span>Referred Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'leads'
                ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineClipboardList className="w-4 h-4" />
            <span>Referred Prospects & Leads ({leads.length})</span>
          </button>
        </div>

        {/* TAB 1: KYC & Bank */}
        {activeTab === 'kyc' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] mb-3 flex items-center gap-1.5">
                  <HiOutlineCreditCard className="w-4 h-4" /> Bank Account for Payouts
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex">
                    <span className="w-36 text-gray-400">Account Holder:</span>
                    <span className="font-bold">{agent?.bankDetails?.accountHolderName || agent?.fullName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">Bank Name:</span>
                    <span className="font-bold">{agent?.bankDetails?.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">Account Number:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {agent?.bankDetails?.accountNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">IFSC Code:</span>
                    <span className="font-mono font-bold text-[#0F766E]">
                      {agent?.bankDetails?.ifscCode || 'N/A'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">Branch Name:</span>
                    <span>{agent?.bankDetails?.branchName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Tax & Legal */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] mb-3 flex items-center gap-1.5">
                  <HiOutlineShieldCheck className="w-4 h-4" /> Legal & Identification
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex">
                    <span className="w-36 text-gray-400">PAN Number:</span>
                    <span className="font-mono font-bold uppercase">{agent?.panNumber || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">Aadhaar Number:</span>
                    <span className="font-mono font-bold">{agent?.aadhaarNumber || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">GSTIN:</span>
                    <span className="font-mono">{agent?.gstNumber || 'Unregistered'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">RERA Registration:</span>
                    <span className="font-mono">{agent?.reraRegistrationNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-gray-400">Area of Operation:</span>
                    <span>{agent?.areaOfOperation || 'Lucknow & Nearby'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Gallery */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-3">
                Uploaded KYC Verification Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: 'PAN Card', url: agent?.panCardDoc },
                  { label: 'Aadhaar Card', url: agent?.aadhaarCardDoc },
                  { label: 'Address Proof', url: agent?.addressProofDoc },
                  { label: 'Cancelled Cheque', url: agent?.bankDetails?.chequeDoc },
                  { label: 'Broker Agreement / MOU', url: agent?.agreementDoc }
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-gray-800">{doc.label}</span>
                        {doc.url ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Available
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                            Not Uploaded
                          </span>
                        )}
                      </div>
                      {doc.url ? (
                        <div
                          onClick={() => setDocPreviewUrl(doc.url)}
                          className="h-28 rounded-xl bg-white border border-gray-200 overflow-hidden cursor-pointer hover:opacity-90 flex items-center justify-center relative group"
                        >
                          <img
                            src={doc.url}
                            alt={doc.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <HiOutlineEye className="w-4 h-4" /> View
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                          No File
                        </div>
                      )}
                    </div>

                    {doc.url && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setDocPreviewUrl(doc.url)}
                          className="flex-1 py-1.5 bg-[#102A2E] hover:bg-[#0F766E] text-white text-[10px] font-bold rounded-lg text-center cursor-pointer transition-colors"
                        >
                          View Full
                        </button>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                          title="Download"
                        >
                          <HiOutlineDownload className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Referred Bookings */}
        {activeTab === 'bookings' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#102A2E]">Referred Plot & Unit Bookings</h3>
                <p className="text-xs text-gray-400">Bookings closed through this partner's network.</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Bookings Attributed to this Partner Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Booking / Customer</th>
                      <th className="py-3 px-4">Plot / Unit</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Deal Value</th>
                      <th className="py-3 px-4">Partner Cut</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {bookings.map((b) => {
                      const deal = Number(b.dealValue || b.totalAmount || b.plotPrice || 0);
                      const cut = Math.round((deal * (stats?.commissionPercent || 2.5)) / 100);
                      return (
                        <tr key={b._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#102A2E]">{b.customerName || b.buyerName || 'Client'}</div>
                            <div className="font-mono text-[10px] text-gray-400">{b.bookingId || b._id?.slice(-6)}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            {b.plotNumber || b.unitNumber || 'Plot'}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-700">{b.projectName || 'Project'}</td>
                          <td className="py-3 px-4 font-black text-[#0F766E]">{formatINR(deal)}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{formatINR(cut)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {b.status || 'Confirmed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Referred Prospects */}
        {activeTab === 'leads' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#102A2E]">Referred Prospects & Enquiries</h3>
                <p className="text-xs text-gray-400">Leads registered by or assigned to this channel partner.</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Prospects Registered by this Partner</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Interested In</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {leads.map((l) => (
                      <tr key={l._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#102A2E]">{l.fullName || l.name}</div>
                          <div className="text-[10px] text-gray-400">{l.city || 'Lead'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-700">{l.phone}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-800">{l.projectInterested || l.projectName || 'All'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            {l.status || 'New'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Lightbox Modal */}
      {docPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 overflow-hidden relative shadow-2xl">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <span className="font-bold text-sm text-[#102A2E]">Document Preview</span>
              <button
                onClick={() => setDocPreviewUrl(null)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-2xl p-2">
              <img
                src={docPreviewUrl}
                alt="Document Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Dossier Modal */}
      {isEditModalOpen && (
        <AgentModal
          isOpen={isEditModalOpen}
          mode="edit"
          agent={agent}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (aData) => {
            try {
              const res = await companyAdminService.updateAgent(id, aData);
              if (res.success) {
                toast.success('Channel partner dossier updated!');
                setIsEditModalOpen(false);
                fetchAgentDetail();
              }
            } catch (err) {
              toast.error(err.response?.data?.message || 'Failed to update agent');
            }
          }}
        />
      )}
    </MainLayout>
  );
};

