import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { agentService } from '../services/agentService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp
} from 'react-icons/hi';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [projectsList, setProjectsList] = useState([]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await agentService.getDashboard();
      if (res && res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load agent dashboard', err);
      toast.error('Failed to load agent dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await agentService.getProjects();
      if (res && res.success) {
        setProjectsList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects list for client registration', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchProjects();
  }, []);

  const handleRegisterClient = () => {
    const projectOptions = projectsList.length > 0
      ? projectsList.map(p => `<option value="${p.name}">${p.name} (${p.location || 'Site'})</option>`).join('')
      : '<option value="">No Active Projects Available</option>';

    Swal.fire({
      title: 'Register New Client',
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1 text-gray-700">Client Full Name *</label>
            <input id="client-name" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. Ramesh Kumar" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Mobile Number *</label>
            <input id="client-phone" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="+91 9876543210" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Interested Project</label>
            <select id="client-project" class="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-teal-500">
              <option value="">Select Project</option>
              ${projectOptions}
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Plot Requirement / Budget</label>
            <input id="client-req" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. 1500 Sqft, ₹30-40 Lakh" />
          </div>
        </div>
      `,
      confirmButtonText: 'Register Client in CRM',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const projectName = document.getElementById('client-project').value;
        const requirement = document.getElementById('client-req').value.trim();

        if (!name || !phone) {
          Swal.showValidationMessage('Name and Phone are mandatory');
          return false;
        }
        return { name, phone, projectName, requirement };
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          const leadPayload = {
            name: res.value.name,
            phone: res.value.phone,
            requirement: res.value.requirement,
            projectName: res.value.projectName,
            branchId: user?.branchId || user?.branch?._id || user?.branch,
            source: 'Channel Partner',
            notes: `Registered directly by Channel Partner / Agent: ${user?.name}`
          };

          const createRes = await agentService.createLead(leadPayload);
          if (createRes && (createRes.success || createRes.data)) {
            toast.success(`Client "${res.value.name}" registered successfully under your Agent ID!`);
            fetchDashboard();
          } else {
            toast.error(createRes?.message || 'Failed to register client');
          }
        } catch (err) {
          console.error('Error creating client lead', err);
          toast.error(err.response?.data?.message || 'Error creating client lead');
        }
      }
    });
  };

  const kpis = dashboardData?.kpis || {};
  const profile = dashboardData?.agentProfile || {};
  const recentBookings = dashboardData?.recentBookings || [];

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <MainLayout title="Channel Partner / Agent Broker Portal">
      {/* Banner */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#102A2E] via-[#0F766E] to-[#102A2E] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A84B] bg-[#D6A84B]/20 px-2 py-0.5 rounded border border-[#D6A84B]/40">
              Channel Partner & Broker Portal
            </span>
            <span className="text-xs text-emerald-300 font-semibold">
              • ID: {profile.agentCode || user?.agentCode || user?.employeeId || 'CP-PARTNER'}
            </span>
          </div>
          <h2 className="text-xl font-black mt-1">
            {profile.name || user?.name || 'Authorized Channel Partner'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 flex flex-wrap items-center gap-2">
            <span>🏢 Associated Company: <strong className="text-white underline">{user?.companyName || user?.company?.name || 'Real Estate Developer'}</strong></span>
            <span>•</span>
            <span>📍 Attached Branch: <strong className="text-emerald-200 bg-white/10 px-2 py-0.5 rounded">{profile.branchName || user?.branchName || user?.branch?.name || 'Central Branch Office'}</strong></span>
            <span>•</span>
            <span>📈 Commission Rate: <strong className="text-[#D6A84B] bg-black/20 px-2 py-0.5 rounded">{profile.commissionRate || '2.0%'}</strong></span>
          </p>
        </div>
        <button
          onClick={handleRegisterClient}
          className="px-5 py-2.5 rounded-xl bg-[#D6A84B] hover:bg-[#B58B35] text-[#102A2E] font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <HiOutlinePlus className="w-4 h-4" /> Register New Customer
        </button>
      </div>

      {/* Commission Metrics with Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase">Total Commission Earned</span>
              <HiOutlineCurrencyRupee className="w-5 h-5 text-[#0F766E]" />
            </div>
            <div className="text-2xl font-black text-[#0F766E] mt-2">{formatCurrency(kpis.totalEarnedCommission)}</div>
            <p className="text-[11px] text-gray-500 mt-1">From {kpis.totalBookings || 0} registered booking deals</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase">Paid & Disbursed</span>
              <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-[#102A2E] mt-2">{formatCurrency(kpis.paidCommission)}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Disbursed to Bank Account</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase">Pending Payout</span>
              <HiOutlineClock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{formatCurrency(kpis.pendingCommission)}</div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Under verification by Accounts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase">My Registered Leads</span>
              <HiOutlineUserGroup className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-[#102A2E] mt-2">{kpis.totalLeads || 0}</div>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">{kpis.totalSiteVisits || 0} Site Visits Arranged</p>
          </div>
        </div>
      )}

      {/* Bookings & Deals Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#102A2E] text-sm">My Registered Bookings & Commissions</h3>
            <p className="text-xs text-gray-500">Live commission calculation mapped directly from company registry</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#102A2E] text-white uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-5">Client Name / Phone</th>
                <th className="py-3 px-5">Plot Details</th>
                <th className="py-3 px-5">Deal Valuation</th>
                <th className="py-3 px-5">Commission Rate</th>
                <th className="py-3 px-5">Calculated Brokerage</th>
                <th className="py-3 px-5">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    <p className="text-sm font-semibold text-gray-600">No bookings registered under your agent code yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Register new clients or get bookings confirmed to track your live commission payouts.</p>
                  </td>
                </tr>
              ) : (
                recentBookings.map((deal) => (
                  <tr key={deal._id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#102A2E]">{deal.customerName || deal.clientName || 'Valued Client'}</div>
                      <div className="text-[11px] text-gray-400">{deal.customerPhone || deal.clientPhone || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-gray-800">
                      {deal.plotNumber ? `Plot ${deal.plotNumber}` : 'Plot Deal'} {deal.projectName ? `(${deal.projectName})` : ''}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-gray-700">{formatCurrency(deal.totalAmount || deal.dealValue)}</td>
                    <td className="py-3.5 px-5 text-gray-600">{deal.agentCommissionPercentage || profile.commissionRate || '2.0%'}</td>
                    <td className="py-3.5 px-5 font-extrabold text-[#0F766E]">{formatCurrency(deal.agentCommissionAmount)}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        deal.agentCommissionStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        deal.agentCommissionStatus === 'Approved' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {deal.agentCommissionStatus === 'Paid' ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> : <HiOutlineClock className="w-3.5 h-3.5" />}
                        {deal.agentCommissionStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};
