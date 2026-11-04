import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { salesUserService } from '../../services/salesUserService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SalesUserFollowups = () => {
  const [loading, setLoading] = useState(true);
  const [followups, setFollowups] = useState([]);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await salesUserService.getMyFollowups();
      if (res.success && Array.isArray(res.data)) {
        setFollowups(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load follow-up reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleCallFollowup = (lead) => {
    Swal.fire({
      title: `Follow-up Call: ${lead.fullName || lead.name}`,
      text: `Customer Phone: ${lead.phone}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Log Call Outcome',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: formValues } = await Swal.fire({
          title: `Update Follow-up: ${lead.fullName || lead.name}`,
          html:
            '<select id="swal-call-result" class="swal2-input">' +
            '<option value="Interested">Interested (Schedule Site Visit)</option>' +
            '<option value="Follow-up Required">Follow-up Required Again</option>' +
            '<option value="Site Visit">Site Visit Confirmed</option>' +
            '<option value="Not Interested">Not Interested (Drop)</option>' +
            '</select>' +
            '<input id="swal-remark" class="swal2-input" placeholder="Call disposition">' +
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
              toast.success('Follow-up updated successfully!');
              fetchFollowups();
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update follow-up');
          }
        }
      }
    });
  };

  return (
    <MainLayout title="My Follow-ups Reminders (Live Pipeline)">
      <div className="space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#102A2E]">Client Follow-up Reminders</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Scheduled calls due for your assigned customers. Stay on top of conversations.
            </p>
          </div>
          <button
            onClick={fetchFollowups}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Followups List */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-500 mt-3">Checking your follow-up schedules...</p>
          </div>
        ) : followups.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
            <HiOutlineCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">All Follow-ups Complete!</p>
            <p className="text-xs text-gray-400 mt-1">You have no pending scheduled follow-up calls right now.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Scheduled Follow-up Date/Time</th>
                    <th className="py-3.5 px-4">Requirement / Plot</th>
                    <th className="py-3.5 px-4">Last Remark</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {followups.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#102A2E]">{lead.fullName || lead.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{lead.phone}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {lead.nextFollowUpDate}
                        </span>
                      </td>
                      <td className="py-3 px-4">{lead.projectInterested || lead.propertySuggested || 'Township Plot'}</td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{lead.lastRemark || 'Follow-up call requested'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleCallFollowup(lead)}
                          className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5 mx-auto"
                        >
                          <HiOutlinePhone className="w-3.5 h-3.5" /> Call Customer
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
