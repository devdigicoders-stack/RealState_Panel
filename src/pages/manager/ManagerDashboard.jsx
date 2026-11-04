import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { HighchartsWrapper } from '../../components/HighchartsWrapper';
import { useAuth } from '../../context/AuthContext';
import { managerService } from '../../services/managerService';
import {
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineSwitchHorizontal,
  HiOutlinePlus,
  HiOutlineRefresh
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export const ManagerDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await managerService.getDashboardStats();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = dashboardData?.metrics || {};
  const branch = dashboardData?.branch;
  const stageCounts = dashboardData?.stageCounts || { fresh: 0, contacted: 0, siteVisit: 0, booking: 0 };
  const freshLeads = dashboardData?.freshLeads || [];
  const recentBookings = dashboardData?.recentBookings || [];
  const executivePerformance = dashboardData?.executivePerformance || [];
  const teamMembers = dashboardData?.teamMembers || [];

  const stats = [
    {
      label: 'Unassigned Fresh Leads',
      value: `${metrics.unassignedLeadsCount || 0} Inquiries`,
      sub: 'Needs executive allocation',
      icon: HiOutlineUserGroup,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200'
    },
    {
      label: 'Active Pipeline Leads',
      value: `${metrics.activePipelineCount || 0} Leads`,
      sub: `Under ${metrics.teamMembersCount || 0} Sales Execs`,
      icon: HiOutlineSwitchHorizontal,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200'
    },
    {
      label: "Today's Follow-ups Due",
      value: `${metrics.todaysFollowupsCount || 0} Follow-ups`,
      sub: 'Scheduled for action today',
      icon: HiOutlineClock,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200'
    },
    {
      label: 'Team Calls Made (Today)',
      value: `${metrics.todayCallsCount || 0} Calls`,
      sub: 'Live outbound connect logs',
      icon: HiOutlinePhone,
      color: 'text-[#0F766E]',
      bg: 'bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Site Visits Scheduled',
      value: `${metrics.siteVisitsCount || 0} Visits`,
      sub: 'Field visits pipeline',
      icon: HiOutlineCalendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200'
    },
    {
      label: 'Bookings Awaiting Sign-off',
      value: `${metrics.pendingBookingsCount || 0} Units`,
      sub: 'Token deals submitted',
      icon: HiOutlineBookmark,
      color: 'text-[#102A2E]',
      bg: 'bg-gray-100 border-gray-200'
    }
  ];

  // Highchart 1: Sales User Performance Bar
  const execCategories = executivePerformance.length > 0
    ? executivePerformance.map(e => e.name)
    : (teamMembers.length > 0 ? teamMembers.map(t => t.name) : ['Amit Kumar', 'Vikash Tiwari', 'Rohit Sharma', 'Pooja Singh']);

  const execVisits = executivePerformance.length > 0
    ? executivePerformance.map(e => e.visits)
    : [2, 1, 3, 0];

  const execBookings = executivePerformance.length > 0
    ? executivePerformance.map(e => e.bookings)
    : [1, 0, 1, 0];

  const salesPerformanceOptions = {
    chart: { type: 'bar', backgroundColor: 'transparent', height: 260 },
    title: { text: null },
    xAxis: {
      categories: execCategories,
      labels: { style: { color: '#64748B', fontSize: '11px' } }
    },
    yAxis: {
      title: { text: 'Conversions & Visits', style: { color: '#64748B', fontSize: '11px' } },
      gridLineColor: '#F1F5F9'
    },
    series: [
      {
        name: 'Site Visits Conducted',
        data: execVisits,
        color: '#0F766E'
      },
      {
        name: 'Token Bookings Closed',
        data: execBookings,
        color: '#D6A84B'
      }
    ],
    credits: { enabled: false }
  };

  // Highchart 2: Pipeline Distribution Donut
  const pipelineDonutOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 260 },
    title: { text: null },
    plotOptions: {
      pie: {
        innerSize: '65%',
        depth: 25,
        dataLabels: { enabled: true, format: '{point.name}: {point.y}' }
      }
    },
    series: [
      {
        name: 'Leads',
        data: [
          { name: 'Fresh / New', y: stageCounts.fresh || 0, color: '#F59E0B' },
          { name: 'Contacted', y: stageCounts.contacted || 0, color: '#3B82F6' },
          { name: 'Site Visit Stage', y: stageCounts.siteVisit || 0, color: '#9333EA' },
          { name: 'Booking Stage', y: stageCounts.booking || 0, color: '#0F766E' }
        ]
      }
    ],
    credits: { enabled: false }
  };

  const handleAssignLead = async (lead) => {
    if (!teamMembers || teamMembers.length === 0) {
      toast.warning('No sales executives found in your branch team. Please add sales executives first.');
      return;
    }

    const inputOptions = {};
    teamMembers.forEach(m => {
      inputOptions[m._id] = `${m.name} (${m.phone || 'Sales Exec'})`;
    });

    const result = await Swal.fire({
      title: `Assign Lead: ${lead.name}`,
      text: `Select an executive from your team to handle this inquiry for ${lead.project}:`,
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
          fetchDashboard();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to assign lead');
      }
    }
  };

  return (
    <MainLayout title="Sales Manager Operations & Team Hub">
      {/* Manager Welcome Banner with Flow Guide */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white shadow-xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D6A84B] text-[#102A2E] font-black text-xl flex items-center justify-center shadow-lg shrink-0">
              {branch?.name ? branch.name.slice(0, 2).toUpperCase() : 'BM'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {branch ? `${branch.name} — Branch Operations Hub` : (user?.branchName ? `${user.branchName} — Operations Hub` : 'Sales Team & Lead Dispatch Hub')}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {branch ? `Branch Manager (${branch.code || 'Head'})` : 'Branch Head'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 flex flex-wrap items-center gap-2">
                <span>🏢 Company: <strong className="text-white underline">{user?.companyName || user?.company?.name || 'Main Tenant Company'}</strong></span>
                <span>•</span>
                <span>📍 Branch: <strong className="text-emerald-300 bg-white/10 px-2 py-0.5 rounded">{user?.branchName || branch?.name || 'Assigned Branch Office'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh Live Data"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>

            <Link
              to="/manager/leads"
              className="px-4 py-2.5 bg-[#D6A84B] hover:bg-[#B58B35] text-[#102A2E] font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <HiOutlineUserGroup className="w-4 h-4" />
              <span>Assign Fresh Leads ({metrics.unassignedLeadsCount || 0})</span>
            </Link>
          </div>
        </div>

        {/* 6-Step Visual Flow Ribbon as requested by user */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A84B] block mb-2">
            MANAGER OPERATIONAL PIPELINE LIFECYCLE:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-semibold text-white/90">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">1. New Lead Inflow</div>
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-amber-300">2. Assign Sales Exec</div>
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">3. Outbound Calls</div>
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-purple-300">4. Site Visit Tour</div>
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">5. Unit Selection</div>
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300">
              6. Booking Approval
            </div>
          </div>
        </div>
      </div>

      {/* 6 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:border-[#0F766E]/40 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#102A2E] tracking-tight">{s.value}</div>
              <div className="text-[11px] font-semibold text-gray-500 mt-1 flex items-center gap-1">
                <span>{s.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Highcharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Executive Sales & Visit Conversion</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Visits completed vs tokens booked per sales executive</p>
            </div>
          </div>
          <HighchartsWrapper options={salesPerformanceOptions} />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Team Lead Pipeline Stages</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Prospect distribution across current stages</p>
            </div>
            <Link to="/manager/leads" className="text-xs font-bold text-[#0F766E] hover:underline">
              Manage Pipeline →
            </Link>
          </div>
          <HighchartsWrapper options={pipelineDonutOptions} />
        </div>
      </div>

      {/* Action Feeds: Fresh Leads Awaiting Assignment & Urgent Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fresh Leads Needs Assignment */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineUserGroup className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-[#102A2E] text-sm">
                Fresh Leads (Unassigned - {freshLeads.length})
              </h3>
            </div>
            <Link to="/manager/leads" className="text-xs font-bold text-[#0F766E] hover:underline">
              Assign All →
            </Link>
          </div>

          <div className="space-y-3">
            {freshLeads.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-700">All Fresh Leads Assigned!</p>
                <p className="text-[10px] text-gray-400">Great job, your team has no pending unallocated leads.</p>
              </div>
            ) : (
              freshLeads.map((ld) => (
                <div
                  key={ld._id || ld.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#102A2E] bg-white px-2 py-0.5 rounded border">
                        {String(ld.id).slice(-6)}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{ld.name}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {ld.project} • <span className="text-[#0F766E] font-semibold">{ld.source}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignLead(ld)}
                    className="px-3 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Assign
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Bookings for Review */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineBookmark className="w-5 h-5 text-[#0F766E]" />
              <h3 className="font-extrabold text-[#102A2E] text-sm">
                Booking Requests from Team ({recentBookings.length})
              </h3>
            </div>
            <Link to="/manager/bookings" className="text-xs font-bold text-[#0F766E] hover:underline">
              View Bookings →
            </Link>
          </div>

          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HiOutlineBookmark className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-700">No Pending Booking Requests</p>
                <p className="text-[10px] text-gray-400">All token bookings are processed or up to date.</p>
              </div>
            ) : (
              recentBookings.map((bk) => (
                <div
                  key={bk._id || bk.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#102A2E] bg-white px-2 py-0.5 rounded border">
                        {String(bk.id).slice(-6)}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{bk.client}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {bk.unit} • Token: <strong className="text-[#0F766E]">{bk.token}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-500 block">By: {bk.exec}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {bk.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
