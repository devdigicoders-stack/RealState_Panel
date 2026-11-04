import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineMail,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineEye
} from 'react-icons/hi';

export const SuperAdminEnquiries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, contacted: 0, converted: 0 });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getEnquiries({
        search: searchTerm,
        status: statusFilter,
        businessType: businessFilter
      });
      if (res && res.success) {
        setEnquiries(res.data || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load enquiries', err);
      toast.error('Failed to load website enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [searchTerm, statusFilter, businessFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await superAdminService.updateEnquiry(id, { status: newStatus });
      if (res && res.success) {
        toast.success(`Enquiry marked as ${newStatus}`);
        fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update enquiry status');
    }
  };

  const handleDeleteEnquiry = (id, name) => {
    Swal.fire({
      title: 'Delete Website Enquiry?',
      text: `Are you sure you want to delete enquiry from "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#DC2626',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await superAdminService.deleteEnquiry(id);
          if (res && res.success) {
            toast.success('Enquiry deleted successfully');
            fetchEnquiries();
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to delete enquiry');
        }
      }
    });
  };

  const handleViewEnquiry = (enq) => {
    Swal.fire({
      title: enq.fullName,
      html: `
        <div class="text-left text-xs space-y-2.5 p-3 bg-gray-50 rounded-xl">
          <p><strong>Mobile:</strong> <a href="tel:${enq.mobileNumber}" class="text-teal-600 font-bold">${enq.mobileNumber}</a></p>
          <p><strong>Email:</strong> ${enq.emailAddress || 'N/A'}</p>
          <p><strong>Company:</strong> ${enq.companyName || 'N/A'}</p>
          <p><strong>Business Type:</strong> <span class="bg-gray-200 px-2 py-0.5 rounded">${enq.businessType || 'N/A'}</span></p>
          <p><strong>Interested In:</strong> <span class="text-teal-700 font-bold">${enq.interestedIn || 'All Software'}</span></p>
          <p><strong>Source:</strong> ${enq.source || 'Website'}</p>
          <p><strong>Received On:</strong> ${enq.createdAt ? new Date(enq.createdAt).toLocaleString('en-IN') : 'N/A'}</p>
          <div class="pt-2 border-t border-gray-200">
            <strong>Client Requirement / Message:</strong>
            <p class="mt-1 p-2 bg-white rounded border border-gray-200 text-gray-700">${enq.message || 'No additional notes provided.'}</p>
          </div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#0F766E'
    });
  };

  const filtered = enquiries;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="Website Leads & Contact Enquiries">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Total Enquiries</span>
            <HiOutlineMail className="w-5 h-5 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-black text-[#102A2E] mt-2">{counts.total || 0}</div>
          <p className="text-[11px] text-gray-500 mt-1">Submitted from landing website</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">New Leads</span>
            <HiOutlineClock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{counts.new || 0}</div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Awaiting sales team call</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Contacted</span>
            <HiOutlinePhone className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{counts.contacted || 0}</div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">Under pitch & demonstration</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Converted Clients</span>
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{counts.converted || 0}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Subscribed SaaS Tenants</p>
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
            placeholder="Search by prospect name, company, mobile, email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'New', 'Contacted', 'Demo Scheduled', 'Converted', 'Closed'].map((st) => (
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
          <button
            onClick={fetchEnquiries}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 cursor-pointer"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A2E] text-white font-semibold">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Prospect Name / Company</th>
                <th className="py-3 px-4 whitespace-nowrap">Contact Details</th>
                <th className="py-3 px-4 whitespace-nowrap">Business Type / Requirement</th>
                <th className="py-3 px-4 whitespace-nowrap">Date & Source</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <TableSkeleton rows={4} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400">
                    <HiOutlineMail className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No website enquiries received yet.</p>
                    <p className="text-xs text-gray-400 mt-1">When prospective clients fill out the contact form on your website, they appear here.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((enq) => (
                  <tr key={enq._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#102A2E]">{enq.fullName}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <HiOutlineOfficeBuilding className="w-3 h-3" />
                        <span>{enq.companyName || 'Individual / Builder'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-800">
                        <a href={`tel:${enq.mobileNumber}`} className="hover:underline text-teal-700">
                          {enq.mobileNumber}
                        </a>
                      </div>
                      <div className="text-[11px] text-gray-400">{enq.emailAddress || 'No email'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{enq.interestedIn || 'Real Estate CRM'}</div>
                      <div className="text-[11px] text-gray-400">{enq.businessType}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                      <div>{enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-IN') : 'Recent'}</div>
                      <div className="text-[10px] text-gray-400">{enq.source || 'Website'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={enq.status || 'New'}
                        onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          enq.status === 'Converted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : enq.status === 'Contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : enq.status === 'Demo Scheduled'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : enq.status === 'Closed'
                            ? 'bg-gray-100 text-gray-700 border-gray-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Demo Scheduled">Demo Scheduled</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewEnquiry(enq)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-all cursor-pointer"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEnquiry(enq._id, enq.fullName)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
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

