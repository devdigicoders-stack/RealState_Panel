import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { ViewToggle } from '../../components/common/ViewToggle';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineCash,
  HiOutlineEye,
  HiOutlineRefresh
} from 'react-icons/hi';
import { salesUserService } from '../../services/salesUserService';

export const SalesUserCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await salesUserService.getMyCustomers({ search: searchTerm });
      if (res && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const handleViewCustomer360 = (cust) => {
    Swal.fire({
      title: `Customer 360°: ${cust.name || cust.customerName || 'Customer'}`,
      html: `
        <div class="text-left text-xs space-y-2.5 p-3 bg-gray-50 rounded-xl">
          <p><strong>Mobile:</strong> ${cust.phone || '-'} | <strong>Email:</strong> ${cust.email || 'N/A'}</p>
          <p><strong>City / Address:</strong> ${cust.city || cust.address || 'Not specified'}</p>
          <p><strong>Status:</strong> <span class="text-emerald-700 font-bold">${cust.status || 'Active'}</span></p>
          <p><strong>Property Interest:</strong> ${cust.propertyInterest || cust.interestedProperty || 'Residential Plots'}</p>
          <div class="p-2.5 bg-white rounded-lg border border-gray-200 grid grid-cols-2 gap-2 text-center">
            <div><span class="text-gray-400">Total Deal</span><p class="font-bold text-gray-800">₹${Number(cust.totalDealValue || cust.budget || 0).toLocaleString('en-IN')}</p></div>
            <div><span class="text-gray-400">Paid Amount</span><p class="font-bold text-emerald-700">₹${Number(cust.paidAmount || 0).toLocaleString('en-IN')}</p></div>
          </div>
          ${cust.notes ? `<p class="mt-2 text-gray-500 italic">Notes: ${cust.notes}</p>` : ''}
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#0F766E'
    });
  };

  const filtered = customers.filter(c => {
    if (stageFilter === 'All') return true;
    return (c.status || '').toLowerCase() === stageFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="My Converted Customers (Sales User)">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">My Customers</p>
            <p className="text-xl font-extrabold text-[#102A2E]">{customers.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HiOutlineCash className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Active Portfolio</p>
            <p className="text-xl font-extrabold text-[#102A2E]">
              {customers.filter(c => c.status !== 'Inactive').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <HiOutlineLocationMarker className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Geographies</p>
            <p className="text-xl font-extrabold text-purple-700">
              {new Set(customers.map(c => c.city).filter(Boolean)).size || 1}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HiOutlinePhone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Contacts Ready</p>
            <p className="text-xl font-extrabold text-amber-700">
              {customers.filter(c => c.phone).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px]">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by customer name, phone, city..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-gray-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="All">All Stages</option>
            <option value="Active">Active</option>
            <option value="Booked">Booked</option>
            <option value="In Progress">In Progress</option>
          </select>

          <button
            onClick={fetchCustomers}
            className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 cursor-pointer"
            title="Refresh Customers"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin text-[#0F766E]' : ''}`} />
          </button>
        </div>

        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Main Table or Grid Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A2E] text-white font-semibold">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Customer Name</th>
                  <th className="py-3 px-4 whitespace-nowrap">Contact & City</th>
                  <th className="py-3 px-4 whitespace-nowrap">Interest / Plot</th>
                  <th className="py-3 px-4 whitespace-nowrap">Total Deal Value</th>
                  <th className="py-3 px-4 whitespace-nowrap">Paid Token / Advance</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      {loading ? 'Loading customers...' : 'No customers found under your sales attribution.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-[#102A2E]">{c.name || c.customerName || 'Customer'}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{c.email || 'No email registered'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">{c.phone || '-'}</div>
                        <div className="text-[11px] text-gray-500">{c.city || 'Location N/A'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-gray-700">{c.propertyInterest || c.interestedProperty || 'Residential Plot'}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-extrabold text-[#102A2E]">
                        ₹{Number(c.totalDealValue || c.budget || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-700">
                        ₹{Number(c.paidAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {c.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewCustomer360(c)}
                          className="px-2.5 py-1 bg-gray-50 hover:bg-[#0F766E] hover:text-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          <span>360° Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {paginated.map((c) => (
            <div key={c._id || c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base text-[#102A2E]">{c.name || c.customerName || 'Customer'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {c.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono">{c.phone || '-'} • {c.email || 'No email'}</p>

                <div className="my-3 p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                  <div><span className="text-gray-400">City:</span> <span className="font-bold text-gray-800">{c.city || 'N/A'}</span></div>
                  <div><span className="text-gray-400">Interest:</span> <span className="font-bold text-gray-800">{c.propertyInterest || c.interestedProperty || 'Residential Plot'}</span></div>
                  <div><span className="text-gray-400">Deal:</span> <span className="font-bold text-[#102A2E]">₹{Number(c.totalDealValue || c.budget || 0).toLocaleString('en-IN')}</span></div>
                  <div><span className="text-gray-400">Paid:</span> <span className="font-bold text-emerald-700">₹{Number(c.paidAmount || 0).toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleViewCustomer360(c)}
                  className="px-3 py-1.5 bg-[#0F766E] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                >
                  <HiOutlineEye className="w-3.5 h-3.5" />
                  <span>360° Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      />
    </MainLayout>
  );
};
