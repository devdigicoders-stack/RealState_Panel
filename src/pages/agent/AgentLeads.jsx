import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { agentService } from '../../services/agentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineRefresh,
  HiOutlineEye
} from 'react-icons/hi';

export const AgentLeads = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await agentService.getMyLeads();
      if (res && res.success) {
        setLeads(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load agent leads', err);
      toast.error('Failed to load your client leads');
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
    fetchLeads();
    fetchProjects();
  }, []);

  const handleRegisterClient = () => {
    const projectOptions = projectsList.length > 0
      ? projectsList.map(p => `<option value="${p.name}">${p.name} (${p.location || 'Site'})</option>`).join('')
      : '<option value="">No Active Projects Available</option>';

    Swal.fire({
      title: 'Register New Client',
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1 text-gray-700">Client Full Name *</label>
            <input id="client-name" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. Ramesh Kumar" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Mobile Number *</label>
            <input id="client-phone" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="+91 9876543210" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Interested Project</label>
            <select id="client-project" class="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-teal-500">
              <option value="">Select Project</option>
              ${projectOptions}
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Plot Requirement / Budget</label>
            <input id="client-req" class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500" placeholder="e.g. 1500 Sqft, ₹30-40 Lakh" />
          </div>
        </div>
      `,
      confirmButtonText: 'Register Client in CRM',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const projectName = document.getElementById('client-project').value;
        const requirement = document.getElementById('client-req').value.trim();

        if (!name || !phone) {
          Swal.showValidationMessage('Name and Phone are mandatory');
          return false;
        }
        return { name, phone, projectName, requirement };
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          const leadPayload = {
            name: res.value.name,
            phone: res.value.phone,
            requirement: res.value.requirement,
            projectName: res.value.projectName,
            branchId: user?.branchId || user?.branch?._id || user?.branch,
            source: 'Channel Partner',
            notes: `Registered directly by Channel Partner / Agent: ${user?.name}`
          };

          const createRes = await agentService.createLead(leadPayload);
          if (createRes && (createRes.success || createRes.data)) {
            toast.success(`Client "${res.value.name}" registered successfully under your Agent ID!`);
            fetchLeads();
          } else {
            toast.error(createRes?.message || 'Failed to register client');
          }
        } catch (err) {
          console.error('Error creating client lead', err);
          toast.error(err.response?.data?.message || 'Error creating client lead');
        }
      }
    });
  };

  const handleViewLead = (lead) => {
    Swal.fire({
      title: lead.name || 'Client Details',
      html: `
        <div class="text-left text-xs space-y-2 p-3 bg-gray-50 rounded-xl">
          <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
          <p><strong>Interested Project:</strong> ${lead.projectName || lead.project?.name || 'Any'}</p>
          <p><strong>Requirement:</strong> ${lead.requirement || 'N/A'}</p>
          <p><strong>Stage / Status:</strong> <span class="font-bold text-[#0F766E]">${lead.stage || lead.status || 'New Lead'}</span></p>
          <p><strong>Assigned Branch:</strong> ${lead.branchName || user?.branchName || 'Central Branch'}</p>
          <p><strong>Registered On:</strong> ${lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN') : 'N/A'}</p>
          ${lead.notes ? `<p><strong>Notes:</strong> ${lead.notes}</p>` : ''}
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#0F766E'
    });
  };

  const filtered = leads.filter(l => {
    const matchesSearch =
      (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.projectName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (l.stage || l.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="My Registered Clients & Leads">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-[#102A2E]">Client Registrations</h2>
          <p className="text-xs text-gray-500">Clients registered under your Broker ID are protected in company records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={handleRegisterClient}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D625C] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" /> Register New Customer
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
            placeholder="Search by client name, mobile, project..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'New Lead', 'Contacted', 'Site Visit', 'Token Received', 'Converted'].map((st) => (
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
                <th className="py-3 px-4 whitespace-nowrap">Client Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Contact Number</th>
                <th className="py-3 px-4 whitespace-nowrap">Interested Project / Req</th>
                <th className="py-3 px-4 whitespace-nowrap">Registered Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Current Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <TableSkeleton rows={4} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400">
                    <HiOutlineUsers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No client leads registered yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Register New Customer" to register your clients.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((lead) => (
                  <tr key={lead._id || lead.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#102A2E]">{lead.name}</div>
                      <div className="text-[11px] text-gray-400">CP Protection Active</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <HiOutlinePhone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{lead.projectName || lead.project?.name || 'General Inquiry'}</div>
                      <div className="text-[11px] text-gray-400">{lead.requirement || 'Plot requirement'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {lead.stage || lead.status || 'Registered'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                      >
                        Inspect
                      </button>
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

