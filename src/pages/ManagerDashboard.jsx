import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const ManagerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const [leads, setLeads] = useState([
    { id: 'LD-401', name: 'Rahul Verma', phone: '+91 98711 22334', requirement: '1000 Sqft Plot', budget: '₹25 Lakh', source: 'Facebook Ads', assignedTo: 'Amit Kumar (Sales Exec)', status: 'Contacted', nextFollowup: 'Tomorrow 11:00 AM' },
    { id: 'LD-402', name: 'Pooja Agarwal', phone: '+91 99100 44556', requirement: '1500 Sqft Corner Plot', budget: '₹40 Lakh', source: 'Website Inquiry', assignedTo: 'Unassigned', status: 'New Lead', nextFollowup: 'Pending Assignment' },
    { id: 'LD-403', name: 'Dr. Sameer Joshi', phone: '+91 94220 77889', requirement: '2000 Sqft Villa Plot', budget: '₹55 Lakh', source: 'Channel Partner (Sharma Prop)', assignedTo: 'Amit Kumar (Sales Exec)', status: 'Site Visit Scheduled', nextFollowup: 'Sunday 3:00 PM' },
    { id: 'LD-404', name: 'Naveen Jindal', phone: '+91 98110 99887', requirement: '1200 Sqft Plot', budget: '₹30 Lakh', source: 'Google Ads', assignedTo: 'Priya (Telecaller)', status: 'Follow-up Required', nextFollowup: 'Today 5:30 PM' },
  ]);

  const handleAssignLead = (leadId) => {
    Swal.fire({
      title: 'Assign Lead to Sales Executive',
      input: 'select',
      inputOptions: {
        'Amit Kumar (Sales Exec)': 'Amit Kumar (Sales Exec)',
        'Priya (Telecaller)': 'Priya (Telecaller)',
        'Rohan (Site Specialist)': 'Rohan (Site Specialist)'
      },
      inputPlaceholder: 'Select Sales User',
      showCancelButton: true,
      confirmButtonColor: '#0F766E'
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, assignedTo: res.value, status: 'Assigned' } : l));
        toast.success(`Lead successfully assigned to ${res.value}`);
      }
    });
  };

  return (
    <MainLayout title="Sales Manager Dashboard & Team Pipeline">
      {/* Top Banner */}
      <div className="mb-6 p-5 rounded-2xl bg-[#102A2E] text-white flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-[#D6A84B]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84B]">Team Operations</span>
          <h2 className="text-xl font-black mt-0.5">Manager Lead Routing & Quality Monitor</h2>
          <p className="text-xs text-gray-300 mt-1">
            Monitor telecallers, lead distributions, upcoming site visits, and verify booking hold requests.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => toast.success('Auto-dialer queue refreshed')}
            className="px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl"
          >
            Refresh Calling Queue
          </button>
        </div>
      </div>

      {/* Metrics Row with Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Pending Assignment</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">
              {leads.filter(l => l.assignedTo === 'Unassigned').length} Leads
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Calls Made Today</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">48 Calls</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Visits Scheduled</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">6 Scheduled</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Booking Approval Req</span>
            <div className="text-2xl font-black text-purple-700 mt-1">2 Pending</div>
          </div>
        </div>
      )}

      {/* Leads Management Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#102A2E] text-sm">Team Leads Distribution</h3>
            <p className="text-xs text-gray-500">Assign unassigned leads or reassign to balance calling load</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Lead / Phone</th>
                <th className="py-3 px-4">Requirement & Budget</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Assigned Sales User</th>
                <th className="py-3 px-4">Lead Stage</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <TableSkeleton rows={4} />
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#102A2E]">{lead.name}</div>
                      <div className="text-[11px] text-gray-400">{lead.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{lead.requirement}</div>
                      <div className="text-[11px] text-[#0F766E] font-bold">{lead.budget}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{lead.source}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        lead.assignedTo === 'Unassigned' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {lead.assignedTo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-700">{lead.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{lead.nextFollowup}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleAssignLead(lead.id)}
                        className="px-3 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {lead.assignedTo === 'Unassigned' ? 'Assign Lead' : 'Reassign'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};
