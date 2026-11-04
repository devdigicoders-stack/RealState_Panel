import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { HighchartsWrapper } from '../../components/HighchartsWrapper';
import { useAuth } from '../../context/AuthContext';
import { companyAdminService } from '../../services/companyAdminService';
import { 
  HiOutlineUsers, 
  HiOutlinePhone, 
  HiOutlineCalendar, 
  HiOutlineLocationMarker, 
  HiOutlineBookmark, 
  HiOutlineCurrencyRupee, 
  HiOutlinePlus, 
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export const CompanyAdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getDashboardStats();
      if (res && res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Quick Add Lead Modal with Live API Submission
  const handleQuickLead = () => {
    Swal.fire({
      title: 'Quick Add Customer Lead',
      html: `
        <div class="text-left text-xs space-y-3 p-1">
          <label class="block font-bold">Client Full Name *:</label>
          <input id="lead-name" class="w-full p-2 border rounded-xl outline-none" placeholder="e.g. Ramesh Chandra" />
          <label class="block font-bold">Mobile Number (10 digits) *:</label>
          <input id="lead-phone" class="w-full p-2 border rounded-xl outline-none" placeholder="+91 9876543210" />
          <label class="block font-bold">Select Project & Requirement:</label>
          <select id="lead-proj" class="w-full p-2 border rounded-xl outline-none">
            <option value="Royal Palm Township">Royal Palm Township (Plot 1200 sqft)</option>
            <option value="Greenview Heights Phase 1">Greenview Heights Phase 1 (Plot 1500 sqft)</option>
            <option value="Emerald Commercial Hub">Emerald Commercial Hub</option>
          </select>
          <label class="block font-bold">Lead Source:</label>
          <select id="lead-src" class="w-full p-2 border rounded-xl outline-none">
            <option value="Website Direct">Website Direct</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Broker / Channel Partner">Broker / Channel Partner</option>
            <option value="Office Walk-in">Office Walk-in</option>
          </select>
        </div>
      `,
      confirmButtonText: 'Register Lead',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('lead-name')?.value;
        const phone = document.getElementById('lead-phone')?.value;
        const projectName = document.getElementById('lead-proj')?.value;
        const source = document.getElementById('lead-src')?.value;
        if (!name || !phone) {
          Swal.showValidationMessage('Please enter both name and mobile number');
          return false;
        }
        return { name, phone, projectName, source };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await companyAdminService.quickAddLead(result.value);
          if (res && res.success) {
            toast.success(res.message || 'Lead registered and added to MongoDB pipeline!');
            fetchDashboard();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to create lead');
        }
      }
    });
  };

  // Approve Booking
  const handleApproveBooking = async (bookingId, bookingNo) => {
    try {
      const res = await companyAdminService.approveBooking(bookingId);
      if (res && res.success) {
        toast.success(`Booking #${bookingNo} approved successfully!`);
        fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve booking');
    }
  };

  // Highchart 1: Lead Conversion Funnel Area Spline
  const leadPipelineOptions = {
    chart: { type: 'areaspline', backgroundColor: 'transparent', height: 260 },
    title: { text: null },
    xAxis: {
      categories: dashboardData?.funnel?.categories || ['New Leads', 'Contacted', 'Interested', 'Site Visit Done', 'Token Booking', 'Sale Registered'],
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: 'bold' } }
    },
    yAxis: {
      title: { text: 'Prospects Count', style: { color: '#64748B', fontSize: '11px' } },
      gridLineColor: '#F1F5F9',
      allowDecimals: false
    },
    series: [
      {
        name: 'Prospects in Stage',
        data: dashboardData?.funnel?.data || [0, 0, 0, 0, 0, 0],
        color: '#0F766E',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(15, 118, 110, 0.45)'],
            [1, 'rgba(15, 118, 110, 0.02)']
          ]
        }
      }
    ],
    credits: { enabled: false }
  };

  // Highchart 2: Plot Inventory Donut
  const plotInventoryOptions = {
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
        name: 'Plots',
        data: dashboardData?.plotDistribution || [
          { name: 'Available Plots', y: 0, color: '#0F766E' },
          { name: 'Booked Plots', y: 0, color: '#102A2E' },
          { name: 'Temporary Hold', y: 0, color: '#D6A84B' },
          { name: 'Registry Done', y: 0, color: '#3B82F6' },
        ]
      }
    ],
    credits: { enabled: false }
  };

  // Highchart 3: Monthly Sales Revenue Trend (Column Chart)
  const revenueTrendOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 240 },
    title: { text: null },
    xAxis: {
      categories: dashboardData?.revenueTrend?.categories || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: 'bold' } }
    },
    yAxis: {
      title: { text: 'Sales Volume (₹ Lakhs)', style: { color: '#64748B', fontSize: '11px' } },
      gridLineColor: '#F1F5F9'
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        color: '#D6A84B'
      }
    },
    series: [
      {
        name: 'Sales Value (₹ Lakhs)',
        data: dashboardData?.revenueTrend?.data || [12, 18, 25, 32, 28, 45],
        color: '#D6A84B'
      }
    ],
    credits: { enabled: false }
  };

  const kpis = dashboardData?.kpis || {};
  const statsList = [
    { label: 'Active Leads Pipeline', value: kpis.leads?.label || '0 Leads', change: kpis.leads?.change || 'Active Pipeline', icon: HiOutlineUsers, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Today Calls Logged', value: kpis.calls?.label || '0 Calls', change: kpis.calls?.change || 'Active Telephony', icon: HiOutlinePhone, color: 'text-[#0F766E]', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Scheduled Site Visits', value: kpis.siteVisits?.label || '0 Visits', change: kpis.siteVisits?.change || '0 Scheduled', icon: HiOutlineCalendar, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Plot Inventory Available', value: kpis.inventory?.label || '0 Plots', change: kpis.inventory?.change || 'Available Inventory', icon: HiOutlineLocationMarker, color: 'text-[#D6A84B]', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Bookings Approved (MTD)', value: kpis.bookings?.label || '0 Units', change: kpis.bookings?.change || 'Sales Volume', icon: HiOutlineBookmark, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Revenue Collected', value: kpis.revenue?.label || '₹0.00 Cr', change: kpis.revenue?.change || 'Token & Installments', icon: HiOutlineCurrencyRupee, color: 'text-[#102A2E]', bg: 'bg-gray-100 border-gray-200' },
  ];

  return (
    <MainLayout title="Company Admin Executive Command Center">
      
      {/* Company Banner */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D6A84B] text-[#102A2E] font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
            {(dashboardData?.company?.name || user?.companyName || 'CO').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">{dashboardData?.company?.name || user?.companyName || 'Your Company'}</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {dashboardData?.company?.plan || 'Enterprise Plan'} • {dashboardData?.company?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              Owner Dashboard • Full operational authority across Projects ({kpis.projects?.total || 0}/{kpis.projects?.limit || 5}), Team ({kpis.staff?.total || 1}/{kpis.staff?.limit || 15}), Leads, Inventory & Bookings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleQuickLead}
            className="px-4 py-2.5 bg-[#D6A84B] hover:bg-[#B58B35] text-[#102A2E] font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>

          <Link
            to="/company_admin/projects"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <HiOutlineOfficeBuilding className="w-4 h-4 text-[#D6A84B]" />
            <span>Manage Projects</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statsList.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:border-[#0F766E]/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#102A2E] tracking-tight">{s.value}</div>
              <div className="text-[11px] font-semibold text-[#0F766E] mt-1 flex items-center gap-1">
                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                <span>{s.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Highcharts: Pipeline Funnel + Plot Inventory Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Lead to Sale Conversion Velocity</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Live prospect movement across pipeline stages</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              ● Live MongoDB Stages
            </span>
          </div>
          <HighchartsWrapper options={leadPipelineOptions} />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Real-Time Plot Inventory Status</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Availability breakdown across all live townships</p>
            </div>
            <Link to="/company_admin/plots" className="text-xs font-bold text-[#0F766E] hover:underline">
              Open Plot Matrix →
            </Link>
          </div>
          <HighchartsWrapper options={plotInventoryOptions} />
        </div>
      </div>

      {/* Highchart 3: Monthly Booking Revenue Velocity */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiOutlineTrendingUp className="w-5 h-5 text-[#D6A84B]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2E]">Monthly Sales & Bookings Value Trend</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Monthly sales revenue (₹ Lakhs) from approved customer plot bookings</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200">
            Total Sales: {kpis.bookings?.change || '₹0'}
          </span>
        </div>
        <HighchartsWrapper options={revenueTrendOptions} />
      </div>

      {/* Live Operational Feeds: Pending Approvals & Scheduled Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Pending Booking Approvals */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineBookmark className="w-5 h-5 text-[#0F766E]" />
              <h3 className="font-extrabold text-[#102A2E] text-sm">Pending Booking Approvals</h3>
            </div>
            <Link to="/company_admin/bookings" className="text-xs font-bold text-[#0F766E] hover:underline">
              View All ({dashboardData?.pendingBookings?.length || 0})
            </Link>
          </div>

          <div className="space-y-3">
            {(!dashboardData?.pendingBookings || dashboardData.pendingBookings.length === 0) ? (
              <div className="p-6 text-center text-gray-400 text-xs">No pending booking approvals found</div>
            ) : (
              dashboardData.pendingBookings.map((bk) => (
                <div key={bk._id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#102A2E] bg-white px-2 py-0.5 rounded border">
                        {bk.bookingId}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{bk.customerName}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {bk.plotNumber} ({bk.projectName || 'Township'}) • Token: <strong className="text-[#0F766E]">₹{(bk.tokenAmount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleApproveBooking(bk._id, bk.bookingId)}
                      className="px-3 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Scheduled Site Visits */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-[#102A2E] text-sm">Today's Site Visit Schedule</h3>
            </div>
            <Link to="/company_admin/site-visits" className="text-xs font-bold text-[#0F766E] hover:underline">
              Site Dispatch →
            </Link>
          </div>

          <div className="space-y-3">
            {(!dashboardData?.upcomingVisits || dashboardData.upcomingVisits.length === 0) ? (
              <div className="p-6 text-center text-gray-400 text-xs">No scheduled visits for today</div>
            ) : (
              dashboardData.upcomingVisits.map((v) => (
                <div key={v._id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                        <HiOutlineClock className="w-3.5 h-3.5" /> {v.timeSlot || '11:00 AM'}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{v.clientName}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {v.projectName} • Driver/Car: <strong className="text-gray-700">{v.vehicle || 'Office Car'}</strong>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#0F766E] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {v.executiveName || 'Executive'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </MainLayout>
  );
};

export default CompanyAdminDashboard;
