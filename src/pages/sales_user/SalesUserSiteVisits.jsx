import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { salesUserService } from '../../services/salesUserService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineLocationMarker,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SalesUserSiteVisits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [siteVisits, setSiteVisits] = useState([]);

  const fetchSiteVisits = async () => {
    try {
      setLoading(true);
      const res = await salesUserService.getMySiteVisits({
        search: searchTerm,
        status: statusFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setSiteVisits(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load site visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteVisits();
  }, [searchTerm, statusFilter]);

  const handleScheduleVisit = () => {
    Swal.fire({
      title: 'Schedule New Site Visit',
      html:
        '<div style="text-align: left; font-size: 13px;">' +
        '<label style="font-weight: bold;">Customer Name *</label>' +
        '<input id="swal-sv-cust" class="swal2-input" placeholder="Customer name" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Customer Phone *</label>' +
        '<input id="swal-sv-phone" class="swal2-input" placeholder="10-digit mobile" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Project *</label>' +
        '<input id="swal-sv-proj" class="swal2-input" placeholder="e.g. Royal Palm Township" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Visit Date & Time *</label>' +
        '<input id="swal-sv-date" type="datetime-local" class="swal2-input" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Pickup Location</label>' +
        '<input id="swal-sv-loc" class="swal2-input" placeholder="Metro station / Home address" style="width: 100%; margin: 6px 0 0 0;">' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Schedule Visit',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const customerName = document.getElementById('swal-sv-cust').value;
        const phone = document.getElementById('swal-sv-phone').value;
        const projectName = document.getElementById('swal-sv-proj').value;
        const visitDate = document.getElementById('swal-sv-date').value;
        const pickupLocation = document.getElementById('swal-sv-loc').value;
        if (!customerName.trim() || !phone.trim() || !projectName.trim() || !visitDate) {
          Swal.showValidationMessage('Please fill all mandatory fields');
          return false;
        }
        return { customerName, phone, projectName, visitDate, pickupLocation };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await salesUserService.scheduleSiteVisit(result.value);
          if (res.success) {
            toast.success('Site visit scheduled successfully!');
            fetchSiteVisits();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to schedule visit');
        }
      }
    });
  };

  const handleUpdateFeedback = (visit) => {
    Swal.fire({
      title: `Visit Feedback: ${visit.customerName}`,
      html:
        '<div style="text-align: left; font-size: 13px;">' +
        '<label style="font-weight: bold;">Visit Status</label>' +
        '<select id="swal-f-stat" class="swal2-input" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<option value="Completed">Completed</option>' +
        '<option value="Cancelled">Cancelled</option>' +
        '<option value="Rescheduled">Rescheduled</option>' +
        '</select>' +
        '<label style="font-weight: bold;">Interested Plot Selected</label>' +
        '<input id="swal-f-plot" class="swal2-input" placeholder="e.g. Plot P-104" style="width: 100%; margin: 6px 0 12px 0;">' +
        '<label style="font-weight: bold;">Customer Feedback & Remarks</label>' +
        '<textarea id="swal-f-rem" class="swal2-textarea" placeholder="Liked sector B, ready to discuss token amount..." style="width: 100%; margin: 6px 0 0 0;"></textarea>' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Save Feedback',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          status: document.getElementById('swal-f-stat').value,
          interestedPlot: document.getElementById('swal-f-plot').value,
          feedback: document.getElementById('swal-f-rem').value
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const res = await salesUserService.updateSiteVisitFeedback(visit._id, result.value);
          if (res.success) {
            toast.success('Site visit feedback recorded!');
            fetchSiteVisits();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update feedback');
        }
      }
    });
  };

  const filtered = siteVisits;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedVisits = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="My Site Visits (Dispatch & Feedback)">
      <div className="space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#102A2E]">My Site Visits</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your site visit schedules, driver coordinates, and update customer feedback after physical tour.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSiteVisits}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleScheduleVisit}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <HiOutlinePlus className="w-4 h-4" /> Schedule Site Visit
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer, phone, project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {['All', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
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
            <p className="text-xs font-bold text-gray-500 mt-3">Loading site visits...</p>
          </div>
        ) : paginatedVisits.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
            <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">No Site Visits Found</p>
            <p className="text-xs text-gray-400 mt-1">Schedule your client physical tours to track feedback.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Visitor / Client</th>
                    <th className="py-3.5 px-4">Project & Plot</th>
                    <th className="py-3.5 px-4">Visit Date & Time</th>
                    <th className="py-3.5 px-4">Pickup Logistics</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Client Feedback</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {paginatedVisits.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#102A2E] text-xs">{v.customerName}</div>
                        <div className="text-[10px] font-mono text-gray-400">{v.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-800">{v.projectName}</div>
                        {v.interestedPlot && <div className="text-[10px] text-emerald-700 font-bold">Selected: {v.interestedPlot}</div>}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-700">{v.visitDate}</td>
                      <td className="py-3 px-4 text-gray-500">{v.pickupLocation}</td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          v.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : v.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {v.status || 'Scheduled'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {v.customerFeedback || 'Feedback pending visit completion'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleUpdateFeedback(v)}
                          className="px-2.5 py-1 bg-white border border-gray-300 hover:border-[#0F766E] text-[#0F766E] text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          Update Feedback
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
