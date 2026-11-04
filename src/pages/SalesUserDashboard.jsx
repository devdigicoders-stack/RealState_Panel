import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { CardSkeleton } from '../components/Skeleton';
import { salesUserService } from '../services/salesUserService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineShieldCheck
} from 'react-icons/hi';

export const SalesUserDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await salesUserService.getDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const { stats, recentLeads = [], recentCalls = [], upcomingVisits = [] } = dashboardData || {};

  const handleCallClient = (lead) => {
    Swal.fire({
      title: `Call ${lead.fullName || lead.name}?`,
      text: `Customer Phone: ${lead.phone}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Log Call Disposition',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: formValues } = await Swal.fire({
          title: `Call Result: ${lead.fullName || lead.name}`,
          html:
            '<select id="swal-call-result" class="swal2-input">' +
            '<option value="Interested">Interested</option>' +
            '<option value="Follow-up Required">Follow-up Required</option>' +
            '<option value="Site Visit">Site Visit Scheduled</option>' +
            '<option value="Not Interested">Not Interested</option>' +
            '<option value="No Answer">No Answer / Busy</option>' +
            '</select>' +
            '<input id="swal-remark" class="swal2-input" placeholder="Call remarks & requirements">' +
            '<input id="swal-next-date" type="datetime-local" class="swal2-input">',
          focusConfirm: false,
          preConfirm: () => {
            return {
              callResult: document.getElementById('swal-call-result').value,
              remark: document.getElementById('swal-remark').value,
              nextFollowUpDate: document.getElementById('swal-next-date').value
            };
          }
        });

        if (formValues) {
          try {
            const res = await salesUserService.logCallDisposition(lead._id, formValues);
            if (res.success) {
              toast.success('Call disposition logged!');
              fetchDashboard();
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log call');
          }
        }
      }
    });
  };

  return (
    <MainLayout title="My Dashboard (Sales & Dispositions)">
      <div className="space-y-6">

        {/* Assigned Workplace / Hierarchy Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#102A2E] to-[#0F766E] text-white rounded-3xl shadow-sm border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#D6A84B] font-black border border-white/15 shrink-0 shadow-inner">
              <HiOutlineOfficeBuilding className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  Sales Executive Active Desk
                </span>
                <span className="text-xs text-emerald-200 font-semibold">• ID: {user?.employeeId || 'SE-DESK'}</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                {user?.name}
              </h2>
              <p className="text-xs text-gray-200 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  🏢 Company: <strong className="text-white underline">{user?.companyName || user?.company?.name || 'Assigned Company'}</strong>
                </span>
                <span className="text-emerald-300">•</span>
                <span className="inline-flex items-center gap-1">
                  📍 Branch: <strong className="text-emerald-200 bg-white/10 px-2 py-0.5 rounded">{user?.branchName || 'Central Branch Office'}</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 bg-white/10 p-2 rounded-2xl border border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="text-left text-xs">
              <div className="text-[10px] text-gray-300 uppercase font-bold">Desk Clearance</div>
              <div className="font-extrabold text-white">Full Calling & CRM Access</div>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">My Assigned Leads</span>
              <div className="text-2xl font-black text-[#102A2E] mt-1">{stats?.totalAssignedLeads || 0}</div>
              <p className="text-[10px] text-gray-500 mt-1">Exclusive to your login</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <HiOutlineUsers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Calls Done Today</span>
              <div className="text-2xl font-black text-[#0F766E] mt-1">{stats?.callsToday || 0}</div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Dispositions updated</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
              <HiOutlinePhone className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Follow-ups Due</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{stats?.followupsDue || 0}</div>
              <p className="text-[10px] text-amber-700 font-semibold mt-1">Pending client calls</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Bookings Closed</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{stats?.closedBookings || 0}</div>
              <p className="text-[10px] text-blue-600 font-semibold mt-1">Approved plot deals</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <HiOutlineBookmark className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#102A2E]">Priority Assigned Leads Pipeline</h2>
            <p className="text-xs text-gray-400">Leads assigned to you by manager or direct routing</p>
          </div>
          <button
            onClick={fetchDashboard}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Assigned Leads Table */}
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : recentLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
            <HiOutlineUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">No Leads Assigned to You Yet</p>
            <p className="text-xs text-gray-400 mt-1">When your manager assigns customer leads, they will appear right here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Project / Requirement</th>
                    <th className="py-3 px-4">Call Result</th>
                    <th className="py-3 px-4">Last Remark</th>
                    <th className="py-3 px-4">Next Follow-up</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#102A2E]">{lead.fullName || lead.name}</td>
                      <td className="py-3 px-4 font-mono text-gray-700">{lead.phone}</td>
                      <td className="py-3 px-4">{lead.projectInterested || 'General Township Inquiry'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lead.lastCallResult || lead.status || 'New'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{lead.lastRemark || 'No remark added'}</td>
                      <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">{lead.nextFollowUpDate || 'Not Set'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleCallClient(lead)}
                          className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1 mx-auto"
                        >
                          <HiOutlinePhone className="w-3.5 h-3.5" /> Call Client
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};
