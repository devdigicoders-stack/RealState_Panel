import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { ViewToggle } from '../../components/common/ViewToggle';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineBookmark,
  HiOutlineSearch,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineRefresh
} from 'react-icons/hi';
import { salesUserService } from '../../services/salesUserService';

export const SalesUserBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await salesUserService.getMyBookings({
        search: searchTerm,
        status: statusFilter
      });
      if (res && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter]);

  const handleCreateBookingRequest = () => {
    Swal.fire({
      title: 'Submit Plot Booking Request',
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1 text-gray-700">Customer Full Name *</label>
            <input id="bkg-name" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="e.g. Ramesh Kumar" />
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Mobile Number *</label>
            <input id="bkg-phone" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="+91 98765 43210" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1 text-gray-700">Project Name *</label>
              <input id="bkg-proj" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="e.g. Royal Palm Township" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-gray-700">Plot Number *</label>
              <input id="bkg-plot" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="e.g. P-105" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1 text-gray-700">Plot Size</label>
              <input id="bkg-size" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="e.g. 1200 Sq.ft" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-gray-700">Token Advance (₹) *</label>
              <input id="bkg-token" type="number" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="100000" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1 text-gray-700">Payment Method & Reference</label>
            <input id="bkg-pay" class="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="e.g. UPI / RTGS Ref: UTR998822" />
          </div>
          <p class="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            ⚠️ <strong>Notice:</strong> Sales Users cannot alter master project or plot rates. Plot final pricing is verified and locked by Master Admin upon approval.
          </p>
        </div>
      `,
      confirmButtonText: 'Submit Request for Approval',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('bkg-name')?.value;
        const phone = document.getElementById('bkg-phone')?.value;
        const proj = document.getElementById('bkg-proj')?.value;
        const plot = document.getElementById('bkg-plot')?.value;
        const size = document.getElementById('bkg-size')?.value;
        const token = document.getElementById('bkg-token')?.value;
        const pay = document.getElementById('bkg-pay')?.value;

        if (!name || !phone || !plot || !token) {
          Swal.showValidationMessage('Customer Name, Phone, Plot No, and Token amount are required');
          return false;
        }
        return { name, phone, proj, plot, size, token, pay };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const val = result.value;
          await salesUserService.createBookingRequest({
            customerName: val.name,
            phone: val.phone,
            projectName: val.proj,
            plotNumber: val.plot,
            plotSize: val.size,
            tokenAmount: val.token,
            paymentMode: val.pay
          });
          toast.success(`Booking request for plot ${val.plot} submitted successfully!`);
          fetchBookings();
        } catch (err) {
          toast.error(err.message || 'Failed to submit booking request');
        }
      }
    });
  };

  const approvedCount = bookings.filter(b => b.status === 'Approved').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending Approval' || b.status === 'Pending').length;
  const totalValue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const paginated = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="My Plot Bookings & Token Requests (Sales User)">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineBookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">My Bookings</p>
            <p className="text-xl font-extrabold text-[#102A2E]">{bookings.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HiOutlineCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Approved</p>
            <p className="text-xl font-extrabold text-[#102A2E]">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HiOutlineClock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Pending Approval</p>
            <p className="text-xl font-extrabold text-amber-700">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <HiOutlineCurrencyRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Pipeline</p>
            <p className="text-xl font-extrabold text-[#102A2E]">
              {totalValue > 0 ? `₹${(totalValue / 100000).toFixed(1)} L` : '₹0'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px]">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by customer, booking no, or plot..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-gray-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={fetchBookings}
            className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 cursor-pointer"
            title="Refresh Bookings"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin text-[#0F766E]' : ''}`} />
          </button>

          <button
            onClick={handleCreateBookingRequest}
            className="px-3.5 py-2 bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#102A2E] cursor-pointer shadow-xs"
          >
            <HiOutlinePlus className="w-3.5 h-3.5 text-[#D6A84B]" />
            <span>Submit Booking Request</span>
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
                  <th className="py-3 px-4 whitespace-nowrap">Booking No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer Name</th>
                  <th className="py-3 px-4 whitespace-nowrap">Plot & Project</th>
                  <th className="py-3 px-4 whitespace-nowrap">Total Deal Value</th>
                  <th className="py-3 px-4 whitespace-nowrap">Token Advance</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payment Mode</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Approval Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400">
                      {loading ? 'Loading bookings...' : 'No bookings found under your portfolio.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((b) => (
                    <tr key={b._id || b.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-600 whitespace-nowrap">
                        {b.bookingId || b.bookingNo || 'N/A'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-[#102A2E]">{b.customerName || b.buyerName || 'Client'}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{b.phone || '-'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">{b.plotNumber || b.plotNo} {b.plotSize ? `(${b.plotSize})` : ''}</div>
                        <div className="text-[11px] text-gray-500">{b.projectName || 'Project'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-extrabold text-[#102A2E]">
                        ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#0F766E]">
                        ₹{Number(b.tokenAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                        {b.paymentMode || 'Online'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {b.status || 'Pending Approval'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-medium text-gray-500">
                        {b.approvedBy ? b.approvedBy : 'Manager / Company Admin'}
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
          {paginated.map((b) => (
            <div key={b._id || b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-gray-400">{b.bookingId || b.bookingNo || 'N/A'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    b.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : b.status === 'Rejected'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {b.status || 'Pending Approval'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#102A2E]">{b.customerName || b.buyerName || 'Client'}</h3>
                <p className="text-xs text-gray-400 font-mono">{b.phone}</p>

                <div className="my-3 p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                  <div><span className="text-gray-400">Plot:</span> <span className="font-bold text-gray-800">{b.plotNumber || b.plotNo} ({b.plotSize || 'Std'})</span></div>
                  <div><span className="text-gray-400">Deal:</span> <span className="font-bold text-[#102A2E]">₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                  <div><span className="text-gray-400">Token:</span> <span className="font-bold text-[#0F766E]">₹{Number(b.tokenAmount || 0).toLocaleString('en-IN')}</span></div>
                  <div><span className="text-gray-400">Mode:</span> <span className="text-gray-600">{b.paymentMode || 'Online'}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-medium">Authority: {b.approvedBy || 'Manager / Company Admin'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={bookings.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      />
    </MainLayout>
  );
};
