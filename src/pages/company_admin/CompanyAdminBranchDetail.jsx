import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { companyAdminService } from '../../services/companyAdminService';
import { BranchModal } from '../../components/company/BranchModal';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePencilAlt,
  HiOutlineRefresh,
  HiOutlineClipboardList,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineUserCircle,
  HiOutlineIdentification
} from 'react-icons/hi';

export const CompanyAdminBranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('staff'); // 'staff', 'leads', 'bookings', 'sitevisits', 'info'

  // Modal for quick edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchBranchDetail = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getBranchDetail(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error('Branch not found');
        navigate('/company_admin/branches');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch branch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBranchDetail();
    }
  }, [id]);

  const formatINR = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleToggleStatus = async () => {
    if (!data?.branch) return;
    const isCurrentlyActive = data.branch.status === 'Active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    const result = await Swal.fire({
      title: `Turn Branch ${newStatus}?`,
      text: `Are you sure you want to change branch status to ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Active' ? '#0F766E' : '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Yes, Make ${newStatus}`
    });

    if (result.isConfirmed) {
      try {
        const res = await companyAdminService.updateBranch(id, { status: newStatus });
        if (res.success) {
          toast.success(`Branch status updated to ${newStatus}`);
          fetchBranchDetail();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update branch status');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-4">Loading Branch Activity and Staff Tracking...</p>
        </div>
      </MainLayout>
    );
  }

  const { branch, stats, staffMembers = [], leads = [], bookings = [], siteVisits = [] } = data || {};

  return (
    <MainLayout>
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company_admin/branches')}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#0F766E] hover:border-[#0F766E] transition-all shadow-xs cursor-pointer"
            title="Back to Branches"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {branch?.branchCode || 'BR-000'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">{branch?.name}</h1>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  branch?.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                ● {branch?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{branch?.branchType || 'Sales Office'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                {branch?.city}, {branch?.state}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={fetchBranchDetail}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Refresh Activity"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePencilAlt className="w-4 h-4 text-[#0F766E]" /> Edit Branch
          </button>

          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              branch?.status === 'Active'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {branch?.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
          </button>
        </div>
      </div>

      {/* KPI Cards: Track Staff, Leads, Bookings, Revenue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Branch Staff</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0F766E]">
              <HiOutlineUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.totalStaff || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-emerald-600 font-bold">{stats?.activeStaff || 0} Active</span> staff members
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Leads Handled</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <HiOutlineClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.totalLeads || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-blue-600 font-bold">{stats?.convertedLeads || 0} Converted</span> / Won
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <HiOutlineShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#102A2E]">{stats?.totalBookings || 0}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            <span className="text-purple-600 font-bold">{stats?.totalSiteVisits || 0}</span> Site Visits logged
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Revenue Generated</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0F766E]">
              <HiOutlineCurrencyRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0F766E]">
            {formatINR(stats?.totalRevenue || 0)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Collected: {formatINR(stats?.totalCollected || 0)}
          </div>
        </div>
      </div>

      {/* Branch In-Charge Card */}
      <div className="bg-gradient-to-r from-[#102A2E] to-[#0F766E] rounded-3xl p-5 sm:p-6 text-white mb-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black">
              {branch?.managerName ? branch.managerName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Branch Manager / In-Charge
              </div>
              <h2 className="text-lg font-black">{branch?.managerName || 'Not Assigned'}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1">
                {branch?.managerPhone && (
                  <span className="flex items-center gap-1 font-mono">
                    <HiOutlinePhone className="w-3.5 h-3.5 text-emerald-300" />
                    {branch.managerPhone}
                  </span>
                )}
                {branch?.managerEmail && (
                  <span className="flex items-center gap-1">
                    <HiOutlineMail className="w-3.5 h-3.5 text-emerald-300" />
                    {branch.managerEmail}
                  </span>
                )}
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  Login Role: Manager
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs flex flex-col gap-1 min-w-[220px]">
            <div className="flex justify-between">
              <span className="text-white/60">Opening Date:</span>
              <span className="font-bold">{branch?.openingDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Phone:</span>
              <span className="font-mono font-bold">{branch?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Projects Assigned:</span>
              <span className="font-bold">
                {branch?.assignedProjects?.length ? branch.assignedProjects.length : 'All Projects'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'staff'
                ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineUsers className="w-4 h-4" />
            <span>Branch Staff Members ({staffMembers.length})</span>
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
            <span>Leads Activity ({leads.length})</span>
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
            <span>Bookings & Revenue ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sitevisits')}
            className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sitevisits'
                ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineCalendar className="w-4 h-4" />
            <span>Site Visits ({siteVisits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-5 py-3.5 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HiOutlineOfficeBuilding className="w-4 h-4" />
            <span>Branch Overview & Address</span>
          </button>
        </div>

        {/* TAB 1: Branch Staff Members */}
        {activeTab === 'staff' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#102A2E]">Assigned Branch Staff & Personnel</h3>
                <p className="text-xs text-gray-400">Track employees and sales executives assigned to this branch.</p>
              </div>
            </div>

            {staffMembers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineUsers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Staff Assigned Directly to this Branch</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Assign sales executives or managers to "{branch?.name}" from Team Management.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Role / Badge</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {staffMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black text-xs">
                              {member.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-[#102A2E]">{member.name}</div>
                              <div className="text-[10px] text-gray-400">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-xs capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            {member.role?.replace('_', ' ')}
                          </span>
                          {member.badge && (
                            <span className="ml-1.5 text-[10px] font-bold text-[#0F766E] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {member.badge}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-700">{member.phone || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              member.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            ● {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Leads Handled */}
        {activeTab === 'leads' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#102A2E]">Branch Leads Pipeline</h3>
                <p className="text-xs text-gray-400">Leads assigned to this branch or its staff members.</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Leads Associated with this Branch Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Lead Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Requirement / Project</th>
                      <th className="py-3 px-4">Status / Stage</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Created</th>
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
                          <div className="text-[10px] text-gray-400">{l.propertyType || 'Plots'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            {l.status || 'New'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-600">
                          {l.assignedToName || (typeof l.assignedTo === 'string' ? l.assignedTo : 'Unassigned')}
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

        {/* TAB 3: Bookings & Revenue */}
        {activeTab === 'bookings' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#102A2E]">Branch Bookings & Closures</h3>
                <p className="text-xs text-gray-400">Deals closed by this branch and total sales volume.</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Closed Bookings for this Branch Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Booking ID / Customer</th>
                      <th className="py-3 px-4">Plot / Unit</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Deal Value</th>
                      <th className="py-3 px-4">Down Payment</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#102A2E]">{b.customerName || b.buyerName || 'Customer'}</div>
                          <div className="font-mono text-[10px] text-gray-400">{b.bookingId || b._id?.slice(-6)}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {b.plotNumber || b.unitNumber || 'Plot'}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-700">{b.projectName || 'Main Township'}</td>
                        <td className="py-3 px-4 font-black text-[#0F766E]">
                          {formatINR(Number(b.dealValue || b.totalAmount || b.plotPrice || 0))}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-800">
                          {formatINR(Number(b.bookingAmount || b.downPayment || 0))}
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

        {/* TAB 4: Site Visits */}
        {activeTab === 'sitevisits' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#102A2E]">Conducted Site Visits</h3>
                <p className="text-xs text-gray-400">Site inspections and client visits conducted through this branch.</p>
              </div>
            </div>

            {siteVisits.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineCalendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No Site Visits Recorded Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-100/75 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Visitor / Client</th>
                      <th className="py-3 px-4">Visit Date & Time</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Cab / Transport</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {siteVisits.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#102A2E]">{v.clientName || v.visitorName || 'Client'}</div>
                          <div className="text-[10px] font-mono text-gray-400">{v.phone}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-700">
                          {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-IN') : 'N/A'} {v.visitTime}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#0F766E]">{v.projectName || 'Site Visit'}</td>
                        <td className="py-3 px-4 text-gray-600">{v.transportRequired ? 'Cab Arranged' : 'Self'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            {v.status || 'Completed'}
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

        {/* TAB 5: Branch Overview & Address */}
        {activeTab === 'info' && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] mb-3">
                Full Physical Address
              </h4>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex">
                  <span className="w-28 text-gray-400">Address Line 1:</span>
                  <span className="font-bold">{branch?.addressLine1 || 'N/A'}</span>
                </div>
                {branch?.addressLine2 && (
                  <div className="flex">
                    <span className="w-28 text-gray-400">Address Line 2:</span>
                    <span>{branch.addressLine2}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-28 text-gray-400">City / District:</span>
                  <span className="font-bold">{branch?.city}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">State:</span>
                  <span className="font-bold">{branch?.state}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">PIN Code:</span>
                  <span className="font-mono font-bold">{branch?.pinCode}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">Country:</span>
                  <span>{branch?.country || 'India'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] mb-3">
                Operational & Contact Details
              </h4>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex">
                  <span className="w-28 text-gray-400">Official Phone:</span>
                  <span className="font-mono font-bold">{branch?.phone}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">Alt Phone:</span>
                  <span className="font-mono">{branch?.alternatePhone || 'None'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">Official Email:</span>
                  <span className="font-bold text-[#0F766E]">{branch?.email || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">Staff Quota:</span>
                  <span>{branch?.numberOfEmployees || 5} Members</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-400">Operating Hours:</span>
                  <span>{branch?.operatingHours || '9:30 AM - 6:30 PM'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <BranchModal
          isOpen={isEditModalOpen}
          mode="edit"
          branch={branch}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (bData) => {
            try {
              const res = await companyAdminService.updateBranch(id, bData);
              if (res.success) {
                toast.success('Branch details updated!');
                setIsEditModalOpen(false);
                fetchBranchDetail();
              }
            } catch (err) {
              toast.error(err.response?.data?.message || 'Failed to update branch');
            }
          }}
        />
      )}
    </MainLayout>
  );
};

