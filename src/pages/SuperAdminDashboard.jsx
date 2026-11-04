import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { CardSkeleton } from '../components/Skeleton';
import { HighchartsWrapper } from '../components/HighchartsWrapper';
import { superAdminService } from '../services/superAdminService';
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineCreditCard, 
  HiOutlineCurrencyRupee, 
  HiOutlineUsers,
  HiOutlinePhone,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
  HiOutlineArrowRight,
  HiOutlineRefresh
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export const SuperAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    expiredCompanies: 0,
    totalUsersAcrossTenants: 0,
    mrr: 0,
    recentCompanies: [],
    tierBreakdown: [],
    mrrChartSeries: [0, 0, 0, 0, 0, 0]
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getDashboardStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      toast.error('Unable to fetch live dashboard telemetry from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 1. Highcharts: Monthly Recurring Revenue (MRR) Growth Area Spline
  const mrrChartOptions = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 280,
      style: { fontFamily: 'inherit' }
    },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      lineColor: '#E2E8F0',
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: '600' } }
    },
    yAxis: {
      title: { text: null },
      gridLineColor: '#F1F5F9',
      labels: {
        formatter: function () {
          return '₹' + (this.value / 1000) + 'k';
        },
        style: { color: '#64748B', fontSize: '11px', fontWeight: '600' }
      }
    },
    tooltip: {
      backgroundColor: '#102A2E',
      borderRadius: 12,
      style: { color: '#FFFFFF', fontSize: '12px' },
      formatter: function () {
        return `<b>${this.x} 2026</b><br/>SaaS MRR: <span style="color:#D6A84B; font-weight:bold;">₹${(this.y || 0).toLocaleString('en-IN')}</span>`;
      }
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(15, 118, 110, 0.45)'],
            [1, 'rgba(15, 118, 110, 0.02)']
          ]
        },
        lineColor: '#0F766E',
        lineWidth: 3,
        marker: {
          radius: 4,
          fillColor: '#D6A84B',
          lineWidth: 2,
          lineColor: '#FFFFFF'
        }
      }
    },
    series: [
      {
        name: 'MRR Collections',
        data: stats.mrrChartSeries?.length ? stats.mrrChartSeries : [0, 0, 0, 0, 0, stats.mrr]
      }
    ]
  };

  // 2. Highcharts: Tier Subscription Distribution Donut (Pie Chart)
  const tierPieChartOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 280,
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: `${stats.totalCompanies}<br/><span style="font-size:11px;font-weight:normal;color:#64748b;">Companies</span>`,
      align: 'center',
      verticalAlign: 'middle',
      y: 10,
      style: { color: '#102A2E', fontWeight: 'bold', fontSize: '20px' }
    },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '70%',
        depth: 25,
        dataLabels: { enabled: false },
        showInLegend: true
      }
    },
    legend: {
      itemStyle: { fontSize: '11px', fontWeight: '600', color: '#334155' },
      symbolRadius: 6
    },
    tooltip: {
      backgroundColor: '#102A2E',
      borderRadius: 10,
      style: { color: '#FFFFFF', fontSize: '12px' },
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} tenants)'
    },
    series: [
      {
        name: 'Tenants Share',
        data: stats.tierBreakdown?.length > 0
          ? stats.tierBreakdown.map((t, idx) => ({
              name: t.name,
              y: t.y,
              color: idx === 0 ? '#0F766E' : idx === 1 ? '#D6A84B' : idx === 2 ? '#38BDF8' : '#8B5CF6'
            }))
          : [
              { name: 'Enterprise Elite', y: 1, color: '#0F766E' },
              { name: 'Standard Growth', y: 0, color: '#D6A84B' }
            ]
      }
    ]
  };

  // 3. Highcharts: Telecom Calling Minutes & SMS Usage Bar (Dynamic from API)
  const trafficCategories = stats.telecomTraffic?.categories || [];
  const trafficVolumes = stats.telecomTraffic?.volumes || [];

  const usageChartOptions = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 260,
      style: { fontFamily: 'inherit' }
    },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: trafficCategories.length > 0 ? trafficCategories : ['No Traffic Logged'],
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: '600' } }
    },
    yAxis: {
      title: { text: null },
      gridLineColor: '#F1F5F9'
    },
    tooltip: {
      backgroundColor: '#102A2E',
      borderRadius: 10,
      style: { color: '#FFFFFF', fontSize: '12px' },
      pointFormat: '{series.name}: <b>{point.y:,.0f} units</b>'
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        colorByPoint: true,
        colors: ['#0F766E', '#14B8A6', '#D6A84B', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1']
      }
    },
    series: [
      {
        name: 'Usage Volume',
        data: trafficVolumes.length > 0 ? trafficVolumes : [0]
      }
    ]
  };

  return (
    <MainLayout title="Platform SaaS Dashboard">
      
      {/* Top Banner Alert / Summary */}
      <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-[#102A2E] via-[#0E353A] to-[#0F766E] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A84B] flex items-center gap-1.5">
            <HiOutlineSparkles className="w-3.5 h-3.5" /> Platform Executive Overview
          </span>
          <h2 className="text-xl font-extrabold mt-0.5 tracking-tight">SaaS Infrastructure & Multi-Tenant Control</h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
            Live telemetry tracking company registrations, telecom gateway uptime, license revenue collections, and server quotas.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh Realtime Telemetry"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link
            to="/superadmin/companies"
            className="px-4 py-2.5 rounded-xl bg-[#D6A84B] hover:bg-[#B58B35] text-[#102A2E] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" /> Onboard Company
          </Link>
          <Link
            to="/superadmin/limits"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
          >
            Adjust Limits
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-[#0F766E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Companies</span>
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                <HiOutlineOfficeBuilding className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">{stats.totalCompanies}</span>
              <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{stats.activeCompanies} Active
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Real estate builders & developers</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-[#0F766E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Recurring Rev</span>
              <div className="w-10 h-10 rounded-xl bg-[#D6A84B]/15 text-[#D6A84B] flex items-center justify-center">
                <HiOutlineCurrencyRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">₹{(stats.mrr || 0).toLocaleString('en-IN')}</span>
              <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live MRR
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">SaaS subscription billing</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-[#0F766E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Staff Users</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">{stats.totalUsersAcrossTenants}</span>
              <span className="ml-2 text-xs font-medium text-gray-500">Across all companies</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Managers, Telecallers, Brokers</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-[#0F766E]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Telecom Gateways</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <HiOutlinePhone className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">
                {stats.telecomGateways?.active || 0} Active
              </span>
              <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {stats.telecomGateways?.sla || '0%'} SLA
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium truncate" title={stats.telecomGateways?.providersList}>
              {stats.telecomGateways?.providersList || 'No Gateways Available'}
            </p>
          </div>
        </div>
      )}

      {/* Highcharts Visualizations Grid (Area Spline + Pie Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Chart: Revenue Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-base text-[#102A2E]">SaaS Monthly Recurring Revenue (MRR)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Platform subscription revenue progression over past 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0F766E] text-xs font-bold border border-emerald-200">
              <HiOutlineTrendingUp className="w-4 h-4" /> Live Aggregation
            </div>
          </div>

          <div className="w-full">
            <HighchartsWrapper options={mrrChartOptions} />
          </div>
        </div>

        {/* Right Chart: Plan Distribution Pie Chart (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#102A2E]">Subscription Tier Share</h3>
            <p className="text-xs text-gray-500 mt-0.5">Active company distribution across SaaS plans</p>
          </div>

          <div className="w-full my-auto">
            <HighchartsWrapper options={tierPieChartOptions} />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Leading Tier:</span>
            <span className="text-[#0F766E] font-bold">
              {stats.tierBreakdown?.[0]?.name || 'Enterprise Elite'}
            </span>
          </div>
        </div>

      </div>

      {/* Row 2: Telecom Calling Minutes Chart + Quick Actions & Recent Platform Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Column 1: Telecom Usage Graph */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-base text-[#102A2E]">Telephony & SMS Traffic</h3>
              <p className="text-xs text-gray-500 mt-0.5">Calling minutes & WhatsApp volumes</p>
            </div>
          </div>
          <HighchartsWrapper options={usageChartOptions} />
        </div>

        {/* Column 2: Recent Activity Timeline */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#102A2E] mb-1">Recent Platform Registrations</h3>
            <p className="text-xs text-gray-500 mb-4">Live company registrations from database</p>
            
            <div className="space-y-3.5">
              {stats.recentCompanies && stats.recentCompanies.length > 0 ? (
                stats.recentCompanies.map((comp, i) => (
                  <div key={comp._id || i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">{comp.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {comp.createdAt ? new Date(comp.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] mt-0.5">
                        Plan: <span className="font-semibold text-[#0F766E]">{comp.plan}</span> • Owner: {comp.ownerName}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No recent companies registered yet</p>
              )}
            </div>
          </div>

          <Link
            to="/superadmin/renewals"
            className="w-full mt-4 py-2 text-center text-xs font-bold text-[#0F766E] hover:underline"
          >
            Check Renewals & Expirations →
          </Link>
        </div>

        {/* Column 3: Quick Action Launchpad */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#102A2E] mb-1">Platform Quick Actions</h3>
            <p className="text-xs text-gray-500 mb-4">Direct shortcuts to SaaS operational tasks</p>

            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/superadmin/companies"
                className="p-3 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-[#0F766E]/5 hover:border-[#0F766E] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                    <HiOutlineOfficeBuilding className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#102A2E] block">Manage All Companies</span>
                    <span className="text-[10px] text-gray-400">View, Activate, Edit or Delete</span>
                  </div>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/superadmin/plans"
                className="p-3 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-[#0F766E]/5 hover:border-[#0F766E] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D6A84B]/15 text-[#D6A84B] flex items-center justify-center font-bold">
                    <HiOutlineCreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#102A2E] block">Create / Edit Plans</span>
                    <span className="text-[10px] text-gray-400">Configure Pricing & Modules</span>
                  </div>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/superadmin/calling-providers"
                className="p-3 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-[#0F766E]/5 hover:border-[#0F766E] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <HiOutlinePhone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#102A2E] block">VoIP Calling Gateways</span>
                    <span className="text-[10px] text-gray-400">Exotel & Tata Tele Settings</span>
                  </div>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/superadmin/settings"
                className="p-3 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-[#0F766E]/5 hover:border-[#0F766E] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <HiOutlineShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#102A2E] block">Security & Password</span>
                    <span className="text-[10px] text-gray-400">Change Admin Credentials</span>
                  </div>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </MainLayout>
  );
};
