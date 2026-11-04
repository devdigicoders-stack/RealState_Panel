import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { agentService } from '../../services/agentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineLocationMarker,
  HiOutlineRefresh,
  HiOutlinePhone
} from 'react-icons/hi';

export const AgentSiteVisits = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [siteVisits, setSiteVisits] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  const fetchSiteVisits = async () => {
    try {
      setLoading(true);
      const res = await agentService.getMySiteVisits();
      if (res && res.success) {
        setSiteVisits(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load site visits', err);
      toast.error('Failed to load site visits');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await agentService.getProjects();
      if (res && res.success) {
        setProjectsList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects list', err);
    }
  };

  useEffect(() => {
    fetchSiteVisits();
    fetchProjects();
  }, []);

  const handleScheduleVisit = () => {
    const projectOptions = projectsList.length > 0
      ? projectsList.map(p => `<option value="${p.name}">${p.name} (${p.location || 'Site'})</option>`).join('')
      : '<option value="">No Active Projects Available</option>';

    Swal.fire({
      title: 'Request Client Site Visit',
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1 text-gray-700">Client Full Name *</label>
            <input id="visit-client" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. Ramesh Kumar" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Client Phone Number *</label>
            <input id="visit-phone" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="+91 9876543210" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Project / Site *</label>
            <select id="visit-project" class="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-teal-500">
              <option value="">Select Project</option>
              ${projectOptions}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1 text-gray-700">Preferred Date *</label>
              <input id="visit-date" type="date" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-gray-700">Time Slot</label>
              <input id="visit-time" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. 11:30 AM" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Plot / Unit Interested</label>
            <input id="visit-plot" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. Plot P-105" />
          </div>
        </div>
      `,
      confirmButtonText: 'Submit Visit Request',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const clientName = document.getElementById('visit-client').value.trim();
        const clientPhone = document.getElementById('visit-phone').value.trim();
        const projectName = document.getElementById('visit-project').value;
        const visitDate = document.getElementById('visit-date').value;
        const timeSlot = document.getElementById('visit-time').value.trim();
        const plotInterested = document.getElementById('visit-plot').value.trim();

        if (!clientName || !clientPhone || !projectName) {
          Swal.showValidationMessage('Client name, phone and project are mandatory');
          return false;
        }
        return { clientName, clientPhone, projectName, visitDate, timeSlot, plotInterested };
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          const payload = {
            ...res.value,
            branchId: user?.branchId || user?.branch?._id || user?.branch,
            notes: `Site visit requested by Channel Partner / Agent: ${user?.name}`
          };
          const createRes = await agentService.requestSiteVisit(payload);
          if (createRes && (createRes.success || createRes.data)) {
            toast.success('Site visit request submitted! Company sales team will coordinate escorting.');
            fetchSiteVisits();
          } else {
            toast.error(createRes?.message || 'Failed to submit request');
          }
        } catch (err) {
          console.error('Error submitting visit', err);
          toast.error(err.response?.data?.message || 'Failed to request site visit');
        }
      }
    });
  };

  const filtered = siteVisits.filter(v => {
    const matchesSearch =
      (v.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.clientPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.plotInterested || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="Client Site Visit Requests">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-[#102A2E]">Escorted Site Visits</h2>
          <p className="text-xs text-gray-500">Track and request company vehicle & sales executive escort for your clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSiteVisits}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={handleScheduleVisit}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D625C] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" /> Request Site Visit
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by client name, project, plot..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#102A2E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A2E] text-white font-semibold">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Client Details</th>
                <th className="py-3 px-4 whitespace-nowrap">Project / Plot</th>
                <th className="py-3 px-4 whitespace-nowrap">Date & Time Slot</th>
                <th className="py-3 px-4 whitespace-nowrap">Assigned Vehicle / Exec</th>
                <th className="py-3 px-4 whitespace-nowrap">Visit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <TableSkeleton rows={4} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    <HiOutlineCalendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No site visits recorded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Schedule a site visit when your client wishes to inspect plots in person.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((visit) => (
                  <tr key={visit._id || visit.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#102A2E]">{visit.clientName}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <HiOutlinePhone className="w-3 h-3" /> {visit.clientPhone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{visit.projectName}</div>
                      <div className="text-[11px] text-gray-400">Unit: {visit.plotInterested || 'Open Tour'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800">
                        {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('en-IN') : 'Scheduled'}
                      </div>
                      <div className="text-[11px] text-gray-400">{visit.timeSlot || '11:00 AM'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-700">{visit.executiveName || 'Sales Desk Assigned'}</div>
                      <div className="text-[11px] text-teal-600 font-semibold">{visit.vehicle || 'Company Escorted'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        visit.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : visit.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {visit.status === 'Completed' ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> : <HiOutlineClock className="w-3.5 h-3.5" />}
                        {visit.status || 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        />
      )}
    </MainLayout>
  );
};

