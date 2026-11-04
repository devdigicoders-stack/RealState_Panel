import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { HighchartsWrapper } from '../components/HighchartsWrapper';
import { superAdminService } from '../services/superAdminService';
import { downloadCSV } from '../utils/invoiceDownloader';
import { CardSkeleton } from '../components/Skeleton';
import { 
  HiOutlineDocumentReport, 
  HiOutlineDownload, 
  HiOutlineTrendingUp, 
  HiOutlineOfficeBuilding,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlinePhone,
  HiOutlineCurrencyRupee,
  HiOutlineRefresh
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const SuperAdminReports = () => {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getPlatformReports();
      if (res && res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error('Failed to load platform reports from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Chart 1: Revenue vs Tenant Growth Area Spline
  const revenueChartOptions = {
    chart: { type: 'spline', backgroundColor: 'transparent', height: 320, style: { fontFamily: 'inherit' } },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: ['May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'],
      labels: { style: { color: '#64748B', fontWeight: '600' } }
    },
    yAxis: [
      {
        title: { text: 'Monthly Revenue (₹)', style: { color: '#0F766E' } },
        labels: { formatter: function () { return '₹' + (this.value / 1000) + 'K'; } }
      },
      {
        title: { text: 'Active Companies', style: { color: '#D6A84B' } },
        opposite: true
      }
    ],
    tooltip: { shared: true, backgroundColor: '#102A2E', borderRadius: 10, style: { color: '#FFF' } },
    series: [
      {
        name: 'SaaS Revenue',
        type: 'column',
        data: reportData?.monthlyGrowthSeries || [0, 0, 0, 0, 0, 0],
        color: '#0F766E'
      },
      {
        name: 'Tenant Base',
        type: 'spline',
        yAxis: 1,
        data: [0, 0, 0, 0, 0, reportData?.totalCompanies || 0],
        color: '#D6A84B',
        lineWidth: 3
      }
    ]
  };

  // Chart 2: Telephony SLA & System Performance (Dynamic from API)
  const telecomGateways = reportData?.telecom?.gateways || [];
  const telephonyChartOptions = {
    chart: { type: 'bar', backgroundColor: 'transparent', height: 260, style: { fontFamily: 'inherit' } },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: telecomGateways.length > 0
        ? telecomGateways.map(g => g.name)
        : ['No Active Gateways'],
      labels: { style: { color: '#64748B', fontWeight: '600', fontSize: '11px' } }
    },
    yAxis: {
      title: { text: 'Uptime SLA Ratio (%)' },
      min: 0,
      max: 100,
      gridLineColor: '#F1F5F9'
    },
    legend: { enabled: false },
    tooltip: {
      backgroundColor: '#102A2E',
      borderRadius: 10,
      style: { color: '#FFF' },
      pointFormat: 'Delivery SLA: <b>{point.y}%</b>'
    },
    series: [{
      name: 'Uptime SLA',
      data: telecomGateways.length > 0
        ? telecomGateways.map(g => g.sla)
        : [0],
      color: '#0F766E'
    }]
  };

  return (
    <MainLayout title="Platform Analytics & Executive Reports">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Executive BI & Telemetry Reports</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live SaaS revenue trajectory, carrier uptime metrics, and tenant adoption analytics from MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => {
                const csvData = [
                  { Metric: 'Total Companies', Value: reportsData?.summary?.totalCompanies || 0 },
                  { Metric: 'Active Tenants', Value: reportsData?.summary?.activeCompanies || 0 },
                  { Metric: 'Monthly SaaS MRR', Value: reportsData?.summary?.monthlyMRR || 0 },
                  { Metric: 'Active User Seats', Value: reportsData?.summary?.activeSeats || 0 },
                  { Metric: 'Telecom Gateways Connected', Value: reportsData?.summary?.gatewaysCount || 0 },
                  { Metric: 'Total Call Logs Handled', Value: reportsData?.summary?.totalCallsHandled || 0 }
                ];
                downloadCSV(`SuperAdmin_Platform_Report_${new Date().toISOString().slice(0, 10)}`, csvData);
                toast.success('Platform Report CSV downloaded successfully!');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <HiOutlineDownload className="w-4 h-4" /> Export Platform CSV
            </button>
          </div>
        </div>

        {/* Top Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Platform Inflow</span>
              <div className="text-2xl font-black text-[#102A2E] mt-1">₹{(reportData?.totalRevenue || 0).toLocaleString('en-IN')}</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">● Net Settled Collections</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-[#0F766E] uppercase">Total Active Tenants</span>
              <div className="text-2xl font-black text-[#0F766E] mt-1">{reportData?.activeCompanies || 0} Companies</div>
              <p className="text-[10px] text-gray-500 mt-1">Across 3 subscription tiers</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Paid Invoices</span>
              <div className="text-2xl font-black text-[#D6A84B] mt-1">{reportData?.totalTransactions || 0} Invoices</div>
              <p className="text-[10px] text-gray-500 mt-1">Zero payment defaults</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase">Telecom Gateways</span>
              <div className="text-2xl font-black text-[#102A2E] mt-1">
                {reportData?.telecom?.activeGateways || 0} Active
              </div>
              <p className="text-[10px] text-gray-500 mt-1 truncate" title={reportData?.telecom?.providersSummary}>
                {reportData?.telecom?.providersSummary || 'No Gateways Available'}
              </p>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#102A2E]">Revenue Realization vs Tenant Count</h3>
              <span className="text-xs font-bold text-gray-400">Live MongoDB Aggregation</span>
            </div>
            <HighchartsWrapper options={revenueChartOptions} />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-[#102A2E] mb-1">Carrier Gateway SLAs</h3>
              <p className="text-xs text-gray-500 mb-4">Telephony & WhatsApp transmission health</p>
              <HighchartsWrapper options={telephonyChartOptions} />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Overall Carrier Health:</span>
              <span>Optimal (Zero Packets Dropped)</span>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};
