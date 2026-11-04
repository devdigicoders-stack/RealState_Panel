import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { managerService } from '../../services/managerService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineRefresh,
  HiOutlinePencilAlt
} from 'react-icons/hi';

export const ManagerSiteVisits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [execFilter, setExecFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [visits, setVisits] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await managerService.getSiteVisits({
        search: searchTerm,
        status: statusFilter,
        executive: execFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setVisits(res.data);
        if (res.teamMembers) setTeamMembers(res.teamMembers);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch site visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [searchTerm, statusFilter, execFilter]);

  const handleUpdateStatus = async (v) => {
    const { value: formValues } = await Swal.fire({
      title: `Update Visit: ${v.clientName}`,
      html: `
        <div style="text-align: left; font-size: 13px;">
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">Visit Outcome / Status:</label>
          <select id="swal-visit-status" class="swal2-input" style="width: 100%; margin: 0 0 12px 0;">
            <option value="Completed" ${v.status === 'Completed' ? 'selected' : ''}>Completed / Site Escorted</option>
            <option value="Completed / Token Paid" ${v.status === 'Completed / Token Paid' ? 'selected' : ''}>Completed / Token Paid</option>
            <option value="Scheduled" ${v.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
            <option value="Rescheduled" ${v.status === 'Rescheduled' ? 'selected' : ''}>Rescheduled</option>
            <option value="Cancelled" ${v.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">Feedback / Executive Notes:</label>
          <textarea id="swal-visit-feedback" class="swal2-textarea" style="width: 100%; margin: 0;" placeholder="Client liked plot layout...">${v.feedback || ''}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Update',
      confirmButtonColor: '#0F766E',
      preConfirm: () => {
        return {
          status: document.getElementById('swal-visit-status').value,
          feedback: document.getElementById('swal-visit-feedback').value
        };
      }
    });

    if (formValues) {
      try {
        const res = await managerService.updateSiteVisit(v._id, formValues);
        if (res.success) {
          toast.success('Site visit status updated successfully!');
          fetchVisits();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update visit');
      }
    }
  };

  return (
    <MainLayout title="Branch Site Visits & Field Tour Inspections">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">Branch Site Visits & Transport Logistics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor client site visits conducted by your branch sales team across townships and projects.
          </p>
        </div>

        <button
          onClick={fetchVisits}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Visits
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client, phone, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none font-bold text-gray-700 bg-white"
          >
            <option value="All">All Visit Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Completed / Token Paid">Completed / Token Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={execFilter}
            onChange={(e) => setExecFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none font-bold text-gray-700 bg-white"
          >
            <option value="All">All Executives</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading site visits from database...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Site Visits Found</p>
          <p className="text-xs text-gray-400 mt-1">Visits logged by sales executives will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Visitor / Client</th>
                  <th className="py-3.5 px-4">Project Interested</th>
                  <th className="py-3.5 px-4">Visit Date & Slot</th>
                  <th className="py-3.5 px-4">Sales Executive</th>
                  <th className="py-3.5 px-4">Visit Status</th>
                  <th className="py-3.5 px-4">Feedback / Notes</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {visits.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#102A2E]">{v.clientName}</div>
                      <div className="font-mono text-[10px] text-gray-400">{v.clientPhone}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#0F766E]">{v.projectName || 'Township'}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">
                        {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                      <div className="text-[10px] text-gray-400">{v.timeSlot || '11:00 AM'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {v.executiveName || 'Sales Exec'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          v.status?.includes('Token') || v.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        ● {v.status || 'Scheduled'}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-gray-600">
                      {v.feedback || 'Client appreciated site infrastructure and master plan.'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleUpdateStatus(v)}
                        className="px-2.5 py-1 bg-white border border-gray-200 hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto"
                        title="Update Status / Notes"
                      >
                        <HiOutlinePencilAlt className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
