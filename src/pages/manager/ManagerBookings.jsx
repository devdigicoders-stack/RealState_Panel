import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { managerService } from '../../services/managerService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineBookmark,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePrinter,
  HiOutlineEye,
  HiOutlineRefresh
} from 'react-icons/hi';

export const ManagerBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await managerService.getBookings({
        search: searchTerm,
        status: statusFilter
      });
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter]);

  const handleReviewAction = async (b, action) => {
    const isApprove = action === 'approve';
    const { value: remarks } = await Swal.fire({
      title: isApprove ? `Recommend Booking: ${b.bookingId}` : `Reject Booking: ${b.bookingId}`,
      text: isApprove
        ? `Recommend this plot booking to the Company Owner / Super Admin for final registration?`
        : `Provide rejection reason for this booking:`,
      input: 'textarea',
      inputPlaceholder: isApprove ? 'e.g. Token received in branch account, KYC verified.' : 'e.g. Incomplete payment proof.',
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#0F766E' : '#DC2626',
      confirmButtonText: isApprove ? 'Yes, Recommend to Owner' : 'Reject Booking'
    });

    if (remarks !== undefined) {
      try {
        const res = await managerService.reviewBooking(b._id, action, remarks);
        if (res.success) {
          toast.success(res.message);
          fetchBookings();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to process booking review');
      }
    }
  };

  const formatINR = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <MainLayout title="Branch Token Bookings & Manager Sign-off">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102A2E]">Token Bookings & Sign-off Audits</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit token payments submitted by branch executives and recommend them for final allotment.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Bookings
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, plot number, booking id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none font-bold text-gray-700 bg-white"
        >
          <option value="All">All Booking Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Recommended to Company Owner">Recommended to Owner</option>
          <option value="Confirmed">Confirmed / Allotted</option>
          <option value="Rejected by Manager">Rejected</option>
        </select>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading token bookings from database...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineBookmark className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Branch Bookings Found</p>
          <p className="text-xs text-gray-400 mt-1">Bookings submitted by your sales executives will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Booking ID / Customer</th>
                  <th className="py-3.5 px-4">Project & Plot</th>
                  <th className="py-3.5 px-4">Deal Value</th>
                  <th className="py-3.5 px-4">Token Submitted</th>
                  <th className="py-3.5 px-4">Sales Executive</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Manager Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#102A2E]">{b.customerName}</div>
                      <div className="font-mono text-[10px] text-gray-400">
                        {b.bookingId || `BK-${String(b._id).slice(-4)}`} • {b.customerPhone}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Plot #{b.plotNumber || 'Unit'}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{b.projectName || 'Township'}</div>
                    </td>

                    <td className="py-3 px-4 font-black text-[#102A2E]">
                      {formatINR(Number(b.dealValue || b.totalAmount || b.plotPrice || 0))}
                    </td>

                    <td className="py-3 px-4 font-bold text-[#0F766E]">
                      {formatINR(Number(b.bookingAmount || b.tokenAmount || b.downPayment || 0))}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {b.salesExecutive || 'Sales Exec'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          b.status === 'Confirmed' || b.status?.includes('Recommended')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status?.includes('Reject')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        ● {b.status || 'Pending'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {!b.managerApproved && b.status !== 'Confirmed' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleReviewAction(b, 'approve')}
                            className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Recommend to Owner"
                          >
                            <HiOutlineCheck className="w-3.5 h-3.5" /> Recommend
                          </button>
                          <button
                            onClick={() => handleReviewAction(b, 'reject')}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Reject"
                          >
                            <HiOutlineX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Signed Off
                        </span>
                      )}
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
