import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { companyAdminService } from '../../services/companyAdminService';
import { TeamModal } from '../../components/company/TeamModal';
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
  HiOutlineCreditCard,
  HiOutlinePhoneIncoming,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiOutlineBriefcase
} from 'react-icons/hi';

export const CompanyAdminTeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isManagerPath = location.pathname.startsWith('/manager');
  const returnPath = isManagerPath ? '/manager/team' : '/company_admin/team';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'leads', 'calls', 'site-visits', 'bookings', 'docs'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getTeamMemberDetail(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error('Sales executive not found');
        navigate(returnPath);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const formatINR = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const handleApprovalAction = async (action) => {
    try {
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

        const res = await companyAdminService.updateTeamMemberApproval(id, { action: 'reject', remarks: reason });
        if (res.success) {
          toast.success(res.message);
          fetchDetail();
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

        const res = await companyAdminService.updateTeamMemberApproval(id, { action: 'handover_to_company' });
        if (res.success) {
          toast.success(res.message);
          fetchDetail();
        }
        return;
      }

      const res = await companyAdminService.updateTeamMemberApproval(id, { action });
      if (res.success) {
        toast.success(res.message);
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee status');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-4">Loading Sales Executive Dossier & Live Tracking...</p>
        </div>
      </MainLayout>
    );
  }

  const { executive, user, stats, leads = [], calls = [], siteVisits = [], bookings = [] } = data || {};

  return (
    <MainLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(returnPath)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#0F766E] hover:border-[#0F766E] transition-all shadow-xs cursor-pointer"
            title="Back to Team"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {executive?.employeeId || 'EMP-000'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">{executive?.fullName}</h1>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  executive?.accountStatus === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : executive?.accountStatus === 'Rejected'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                ● {executive?.accountStatus || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{executive?.designation || 'Sales Executive'}</span>
              <span>•</span>
              <span>{executive?.branchName ? `Branch: ${executive.branchName}` : 'Head Office'}</span>
              <span>•</span>
              <span>{executive?.workLocation || 'Office'} ({executive?.employmentType || 'Full Time'})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            onClick={fetchDetail}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Refresh Live Data"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePencilAlt className="w-4 h-4 text-[#0F766E]" /> Edit Dossier
          </button>

          {/* Role based actions */}
          {isManagerPath ? (
            executive?.handoverStatus === 'Reviewed & Handed Over' ? (
              <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-blue-600" /> Handed Over to Company
              </span>
            ) : executive?.accountStatus === 'Active' ? (
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
            executive?.accountStatus !== 'Active' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprovalAction('approve')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" /> Company Approve & Activate
                </button>
                <button
                  onClick={() => handleApprovalAction('reject')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <HiOutlineXCircle className="w-4 h-4" /> Reject Dossier
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

      {/* Handover & Origin Status Strip */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              executive?.accountStatus === 'Active'
                ? 'bg-emerald-50 text-emerald-700'
                : executive?.handoverStatus === 'Reviewed & Handed Over'
                ? 'bg-blue-50 text-blue-700'
                : executive?.accountStatus === 'Rejected'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              <HiOutlineShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#102A2E] text-sm">
                  {executive?.accountStatus === 'Active'
                    ? 'Active & Company Approved'
                    : executive?.handoverStatus === 'Reviewed & Handed Over'
                    ? 'Branch Verified & Handed Over to Company'
                    : executive?.accountStatus === 'Rejected'
                    ? 'Rejected by Company'
                    : 'Branch Verification Pending'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  executive?.isReviewedByBranch ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {executive?.isReviewedByBranch ? 'Branch Review: Done' : 'Branch Review: Pending'}
                </span>
              </div>
              <p className="text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-700">Origin: </span>
                {executive?.branchName ? `Branch: ${executive.branchName}` : 'Company Direct'}
                {executive?.createdByUserName && ` • Created by: ${executive.createdByUserName}`}
                {executive?.branchReviewedByName && ` • Verified by: ${executive.branchReviewedByName}`}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-gray-400">Login Authentication: </span>
            <span className={`font-bold ${executive?.accountStatus === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
              {executive?.accountStatus === 'Active' ? 'Enabled' : 'Blocked (Approval Required)'}
            </span>
            {executive?.companyRejectionReason && (
              <p className="text-red-600 font-medium text-[11px] mt-0.5 bg-red-50 px-2 py-1 rounded border border-red-200">
                Reason: {executive.companyRejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards: Track Leads, Calls, Site Visits, Bookings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Assigned Leads</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <HiOutlineClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.totalLeads || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-purple-600 font-bold">{stats?.activeLeads || 0}</span> In Active Pipeline
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">CRM Calls Done</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <HiOutlinePhoneIncoming className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.totalCalls || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-blue-600 font-bold">{stats?.interestedCalls || 0}</span> Interested Dispositions
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Site Visits Hosted</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <HiOutlineCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.siteVisitsCount || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-amber-600 font-bold">{stats?.completedSiteVisits || 0}</span> Completed Visits
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Deals Closed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0F766E]">
              <HiOutlineBookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0F766E]">{stats?.totalBookings || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            Volume: <span className="font-bold text-emerald-700">{formatINR(stats?.totalSalesVolume || 0)}</span>
          </div>
        </div>
      </div>

      {/* Profile Strip */}
      <div className="bg-gradient-to-r from-[#102A2E] to-[#0F766E] rounded-3xl p-5 sm:p-6 text-white mb-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={executive?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={executive?.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Sales Employee Dossier
              </div>
              <h2 className="text-lg font-black">{executive?.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <HiOutlinePhone className="w-3.5 h-3.5 text-emerald-300" />
                  {executive?.mobileNumber}
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineMail className="w-3.5 h-3.5 text-emerald-300" />
                  {executive?.loginEmail}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  Monthly CTC: {formatINR(executive?.monthlyCtc || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs flex flex-col gap-1 min-w-[220px]">
            <div className="flex justify-between">
              <span className="text-white/60">Reporting Manager:</span>
              <span className="font-bold text-emerald-300">{executive?.reportingManager || 'Branch Head'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">PAN:</span>
              <span className="font-mono font-bold uppercase">{executive?.panNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Lead Scope:</span>
              <span className="font-bold">{executive?.leadAccess || 'Own'} Leads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Employment & Salary Details', icon: HiOutlineUserGroup },
            { id: 'leads', label: `Assigned Leads (${leads.length})`, icon: HiOutlineClipboardList },
            { id: 'calls', label: `Calls Logged (${calls.length})`, icon: HiOutlinePhoneIncoming },
            { id: 'site-visits', label: `Site Visits (${siteVisits.length})`, icon: HiOutlineCalendar },
            { id: 'bookings', label: `Deals & Bookings (${bookings.length})`, icon: HiOutlineBookmark },
            { id: 'docs', label: 'KYC & Uploaded Documents', icon: HiOutlineDocumentText }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Overview & Salary */}
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employment Card */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] mb-3 flex items-center gap-1.5">
                  <HiOutlineBriefcase className="w-4 h-4" /> Employment Details
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Employee ID:</span>
                    <span className="font-mono font-bold text-emerald-800">{executive?.employeeId}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Designation:</span>
                    <span className="font-bold">{executive?.designation}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Department:</span>
                    <span>{executive?.department || 'Sales'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Branch:</span>
                    <span className="font-bold">{executive?.branchName || 'Head Office'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Joining Date:</span>
                    <span>{executive?.joiningDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Employment Status:</span>
                    <span className="font-bold text-emerald-700">{executive?.employmentStatus || 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Salary & Bank Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] mb-3 flex items-center gap-1.5">
                  <HiOutlineCurrencyRupee className="w-4 h-4" /> Salary & Bank Account
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Monthly Basic:</span>
                    <span className="font-bold">{formatINR(executive?.basicSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">HRA + Allowances:</span>
                    <span>{formatINR((executive?.hra || 0) + (executive?.allowances || 0))}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Gross Monthly CTC:</span>
                    <span className="font-black text-[#0F766E]">{formatINR(executive?.monthlyCtc || 0)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Bank Name:</span>
                    <span>{executive?.bankDetails?.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-gray-200/60">
                    <span className="text-gray-400">Account Number:</span>
                    <span className="font-mono font-bold">{executive?.bankDetails?.accountNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IFSC Code:</span>
                    <span className="font-mono font-bold text-emerald-700">{executive?.bankDetails?.ifscCode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                Emergency Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
                <div>
                  <span className="text-gray-400 block text-[10px]">Contact Person:</span>
                  <span className="font-bold">{executive?.emergencyContact?.name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Relationship:</span>
                  <span>{executive?.emergencyContact?.relationship || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Phone Number:</span>
                  <span className="font-mono font-bold">{executive?.emergencyContact?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Leads */}
        {activeTab === 'leads' && (
          <div className="p-4 sm:p-6">
            {leads.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Leads Assigned to this Executive Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Interested In</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {leads.map((l) => (
                      <tr key={l._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#102A2E]">{l.fullName || l.name}</td>
                        <td className="py-3 px-4 font-mono text-gray-700">{l.phone}</td>
                        <td className="py-3 px-4">{l.projectInterested || l.projectName || 'All Projects'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            {l.status || 'New'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">
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

        {/* TAB 3: Calls */}
        {activeTab === 'calls' && (
          <div className="p-4 sm:p-6">
            {calls.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlinePhoneIncoming className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Calls Logged by this Executive Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Client / Number</th>
                      <th className="py-3 px-4">Call Result</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Remarks</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {calls.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#102A2E]">{c.customerName || c.clientPhone || 'Client'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {c.callResult || c.status || 'Connected'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{c.duration || '2m 14s'}</td>
                        <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{c.remarks || 'Client requested details'}</td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">
                          {c.callDate ? new Date(c.callDate).toLocaleString('en-IN') : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Site Visits */}
        {activeTab === 'site-visits' && (
          <div className="p-4 sm:p-6">
            {siteVisits.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineCalendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Site Visits Conducted Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Visitor / Client</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Visit Date</th>
                      <th className="py-3 px-4">Outcome / Feedback</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {siteVisits.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#102A2E]">{s.customerName || s.clientName}</td>
                        <td className="py-3 px-4">{s.projectName || 'Township'}</td>
                        <td className="py-3 px-4 font-mono">{s.visitDate || 'Today'}</td>
                        <td className="py-3 px-4 text-gray-500">{s.customerFeedback || s.remarks || 'Positive'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status || 'Scheduled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Bookings */}
        {activeTab === 'bookings' && (
          <div className="p-4 sm:p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineBookmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Deals Closed Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plot / Unit</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Deal Value</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#102A2E]">{b.customerName || b.buyerName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{b.plotNumber || 'Unit'}</td>
                        <td className="py-3 px-4">{b.projectName || 'Project'}</td>
                        <td className="py-3 px-4 font-black text-[#0F766E]">
                          {formatINR(b.totalAmount || b.dealValue || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {b.status || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Uploaded KYC Docs */}
        {activeTab === 'docs' && (
          <div className="p-4 sm:p-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">
              Employee KYC & Employment Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'PAN Card', url: executive?.panCardDoc },
                { label: 'Aadhaar Card', url: executive?.aadhaarDoc },
                { label: 'Resume / CV', url: executive?.resumeDoc },
                { label: 'Experience Letter', url: executive?.experienceLetterDoc },
                { label: 'Education Certificate', url: executive?.educationCertDoc },
                { label: 'Offer Letter', url: executive?.offerLetterDoc }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-gray-800">{doc.label}</span>
                      {doc.url ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Uploaded
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
        )}
      </div>

      {/* Lightbox Preview */}
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
              <img src={docPreviewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <TeamModal
          isOpen={isEditModalOpen}
          mode="edit"
          member={executive}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (mData) => {
            try {
              const res = await companyAdminService.updateTeamMember(id, mData);
              if (res.success) {
                toast.success('Sales Executive details updated!');
                setIsEditModalOpen(false);
                fetchDetail();
              }
            } catch (err) {
              toast.error(err.response?.data?.message || 'Failed to update employee');
            }
          }}
        />
      )}
    </MainLayout>
  );
};

