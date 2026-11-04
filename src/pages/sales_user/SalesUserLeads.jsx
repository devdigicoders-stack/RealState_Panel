import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { salesUserService } from '../../services/salesUserService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SalesUserLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await salesUserService.getMyLeads({
        search: searchTerm,
        status: statusFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setLeads(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load assigned leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

  const handleLogCall = (lead) => {
    Swal.fire({
      title: `Log Call Disposition: ${lead.fullName || lead.name}`,
      html:
        '<div style="text-align: left; font-size: 13px;">' +
        '<label style="font-weight: bold;">Call Result *</label>' +
        '<select id="swal-call-res" class="swal2-input" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<option value="Interested">Interested</option>' +
        '<option value="Follow-up Required">Follow-up Required</option>' +
        '<option value="Site Visit">Site Visit Scheduled</option>' +
        '<option value="Not Interested">Not Interested</option>' +
        '<option value="No Answer">No Answer / Busy</option>' +
        '<option value="Wrong Number">Wrong Number</option>' +
        '</select>' +
        '<label style="font-weight: bold;">Remark *</label>' +
        '<input id="swal-call-rem" class="swal2-input" placeholder="Call outcome / client requirement" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Next Follow-up Date</label>' +
        '<input id="swal-call-date" type="datetime-local" class="swal2-input" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Suggested Plot / Project</label>' +
        '<input id="swal-call-plot" class="swal2-input" placeholder="e.g. Plot P-102 (Royal Palm)" style="width: 100%; margin: 6px 0 0 0;">' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Save Disposition',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const callResult = document.getElementById('swal-call-res').value;
        const remark = document.getElementById('swal-call-rem').value;
        const nextFollowUpDate = document.getElementById('swal-call-date').value;
        const interestedPlot = document.getElementById('swal-call-plot').value;
        if (!remark.trim()) {
          Swal.showValidationMessage('Please write a call remark');
          return false;
        }
        return { callResult, remark, nextFollowUpDate, interestedPlot };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await salesUserService.logCallDisposition(lead._id, result.value);
          if (res.success) {
            toast.success('Call disposition logged and synced!');
            fetchLeads();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update disposition');
        }
      }
    });
  };

  const filtered = leads;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedLeads = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="My Assigned Leads & Dispositions">
      <div className="space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#102A2E]">My Assigned Leads</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Strictly isolated to your user credentials. Seniors / managers track your call dispositions.
            </p>
          </div>
          <button
            onClick={fetchLeads}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, phone, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {['All', 'New', 'Interested', 'Follow-up', 'Site Visit', 'Lost'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#102A2E] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-500 mt-3">Loading your assigned leads...</p>
          </div>
        ) : paginatedLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
            <HiOutlineUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">No Leads Found</p>
            <p className="text-xs text-gray-400 mt-1">Leads assigned to you by manager will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Requirement / Project</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4">Last Remark</th>
                    <th className="py-3.5 px-4">Next Follow-up</th>
                    <th className="py-3.5 px-4 text-center">CRM Calling Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {paginatedLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#102A2E] text-xs">{lead.fullName || lead.name}</div>
                        <div className="text-[10px] text-gray-400">{lead.city || 'Lead'} • Source: {lead.source || 'Inbound'}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{lead.phone}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800">{lead.projectInterested || 'Township Plot'}</span>
                        {lead.budget && <div className="text-[10px] text-gray-400">{lead.budget}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          lead.status === 'Interested'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : lead.status === 'Lost'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : lead.status === 'Follow-up'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {lead.status || 'New'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {lead.lastRemark || lead.remarks || 'No remarks logged yet'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {lead.nextFollowUpDate || 'Not set'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleLogCall(lead)}
                          className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5 mx-auto"
                        >
                          <HiOutlinePhone className="w-3.5 h-3.5" /> Call & Disposition
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filtered.length}
          />
        )}

      </div>
    </MainLayout>
  );
};
