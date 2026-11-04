import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { HighchartsWrapper } from '../../components/HighchartsWrapper';
import { companyAdminService } from '../../services/companyAdminService';
import { CardSkeleton } from '../../components/Skeleton';
import {
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlineCalendar,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineCurrencyRupee,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineBookmark
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const CompanyAdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getReports();
      if (res && res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const projectCategories = reportData?.salesByProject?.categories || [];
  const projectVolume = reportData?.salesByProject?.volume || [];
  const projectCollected = reportData?.salesByProject?.collected || [];

  // Highchart 1: Sales Revenue per Project
  const salesByProjectOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 280, style: { fontFamily: 'inherit' } },
    title: { text: null },
    xAxis: {
      categories: projectCategories.length > 0 ? projectCategories : ['No Projects Yet'],
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: 'bold' } }
    },
    yAxis: {
      title: { text: 'Revenue (₹ in Lakhs)', style: { color: '#64748B', fontSize: '11px' } },
      gridLineColor: '#F1F5F9'
    },
    tooltip: {
      backgroundColor: '#102A2E',
      borderRadius: 10,
      style: { color: '#FFFFFF', fontSize: '12px' },
      pointFormat: '{series.name}: <b>₹{point.y} Lakhs</b>'
    },
    series: [
      {
        name: 'Booked Sales Volume (₹L)',
        data: projectVolume.length > 0 ? projectVolume : [0],
        color: '#0F766E'
      },
      {
        name: 'Collected Cash / Token (₹L)',
        data: projectCollected.length > 0 ? projectCollected : [0],
        color: '#D6A84B'
      }
    ],
    credits: { enabled: false }
  };

  const staffCategories = reportData?.staffEfficiency?.categories || [];
  const staffCalls = reportData?.staffEfficiency?.calls || [];
  const staffVisits = reportData?.staffEfficiency?.visits || [];

  // Highchart 2: Calling Telephony Efficiency
  const callingEfficiencyOptions = {
    chart: { type: 'bar', backgroundColor: 'transparent', height: 280, style: { fontFamily: 'inherit' } },
    title: { text: null },
    xAxis: {
      categories: staffCategories.length > 0 ? staffCategories : ['No Staff Active'],
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: 'bold' } }
    },
    yAxis: {
      title: { text: 'Activity Volume Count', style: { color: '#64748B', fontSize: '11px' } },
      gridLineColor: '#F1F5F9'
    },
    tooltip: {
      backgroundColor: '#102A2E',
      borderRadius: 10,
      style: { color: '#FFFFFF', fontSize: '12px' },
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    series: [
      {
        name: 'Calls Connected',
        data: staffCalls.length > 0 ? staffCalls : [0],
        color: '#0F766E'
      },
      {
        name: 'Site Visits Generated',
        data: staffVisits.length > 0 ? staffVisits : [0],
        color: '#9333EA'
      }
    ],
    credits: { enabled: false }
  };

  const summary = reportData?.summary || {
    totalRevenueLakhs: 0,
    totalCollectedLakhs: 0,
    totalBookings: 0,
    totalPlots: 0,
    bookedPlots: 0,
    availablePlots: 0,
    totalLeads: 0,
    totalCustomers: 0,
    totalVisits: 0,
    totalCalls: 0
  };

  return (
    <MainLayout title="Company Operational Analytics">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Business Intelligence & Reports</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live BI Engine
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner evaluates project-wise revenue realization, staff telephony productivity, and site conversion ratios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => toast.success('Exporting full company operational PDF audit report...')}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlineDownload className="w-4 h-4" />
            <span>Export BI PDF</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Booked Sales Volume</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">₹{summary.totalRevenueLakhs} L</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              ₹{summary.totalCollectedLakhs} L Advance Realized
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineCurrencyRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Total Bookings</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{summary.totalBookings} Units</div>
            <p className="text-[10px] text-gray-500 mt-1">
              {summary.availablePlots} Plots Still Available
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HiOutlineBookmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">CRM Pipeline</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{summary.totalLeads} Leads</div>
            <p className="text-[10px] text-gray-500 mt-1">
              {summary.totalCustomers} Converted Clients
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase">Field Executions</span>
            <div className="text-2xl font-black text-purple-700 mt-1">{summary.totalVisits} Visits</div>
            <p className="text-[10px] text-gray-500 mt-1">
              {summary.totalCalls} Calls Dialed
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <HiOutlineLocationMarker className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2 Highcharts BI Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Chart 1: Project Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Revenue Realization by Township</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Booked sales volume vs cleared cash tokens</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-[#0F766E] px-2 py-0.5 rounded border border-emerald-200">
              Live Revenue
            </span>
          </div>
          <HighchartsWrapper options={salesByProjectOptions} />
        </div>

        {/* Chart 2: Telephony Productivity */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Sales Rep Telephony & Visit Efficiency</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Connected client calls converted to ground visits</p>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              Field Productivity
            </span>
          </div>
          <HighchartsWrapper options={callingEfficiencyOptions} />
        </div>

      </div>

    </MainLayout>
  );
};

export default CompanyAdminReports;
