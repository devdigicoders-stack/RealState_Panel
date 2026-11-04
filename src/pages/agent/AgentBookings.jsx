import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { agentService } from '../../services/agentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineBookmark,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineRefresh,
  HiOutlineEye
} from 'react-icons/hi';

export const AgentBookings = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await agentService.getMyBookings();
      if (res && res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load agent bookings', err);
      toast.error('Failed to load client bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  const filtered = bookings.filter(b => {
    const matchesSearch =
      (b.customerName || b.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customerPhone || b.clientPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.plotNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.bookingId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleInspectBooking = (b) => {
    Swal.fire({
      title: `Booking ID: ${b.bookingId || 'BKG-CONFIRMED'}`,
      html: `
        <div class="text-left text-xs space-y-2 p-3 bg-gray-50 rounded-xl">
          <p><strong>Customer:</strong> ${b.customerName || b.clientName} (${b.customerPhone || b.clientPhone || 'N/A'})</p>
          <p><strong>Project:</strong> ${b.projectName || 'Township Project'}</p>
          <p><strong>Plot / Unit:</strong> Plot ${b.plotNumber || 'N/A'}</p>
          <p><strong>Total Deal Value:</strong> <span class="font-bold text-[#102A2E]">${formatCurrency(b.totalAmount || b.dealValue)}</span></p>
          <p><strong>Token / Paid:</strong> <span class="text-emerald-700 font-bold">${formatCurrency(b.paidAmount || b.tokenAmount)}</span></p>
          <p><strong>Booking Status:</strong> <span class="font-bold">${b.status || 'Confirmed'}</span></p>
          <p><strong>Commission Status:</strong> <span class="font-bold text-amber-700">${b.agentCommissionStatus || 'Under Review'}</span></p>
          <p><strong>Calculated Brokerage:</strong> <span class="font-bold text-[#0F766E]">${formatCurrency(b.agentCommissionAmount)}</span></p>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#0F766E'
    });
  };

  return (
    <MainLayout title="My Client Bookings & Closures">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-[#102A2E]">Confirmed Client Bookings</h2>
          <p className="text-xs text-gray-500">Live booking registrations closed and credited under your channel partner code</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
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
            placeholder="Search by customer name, booking ID, plot number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Approved', 'Confirmed', 'Pending'].map((st) => (
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
                <th className="py-3 px-4 whitespace-nowrap">Booking ID / Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Customer Details</th>
                <th className="py-3 px-4 whitespace-nowrap">Project & Plot</th>
                <th className="py-3 px-4 whitespace-nowrap">Deal Valuation</th>
                <th className="py-3 px-4 whitespace-nowrap">Broker Commission</th>
                <th className="py-3 px-4 whitespace-nowrap">Deal Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <TableSkeleton rows={4} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    <HiOutlineBookmark className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No client bookings found.</p>
                    <p className="text-xs text-gray-400 mt-1">Bookings finalized from your client leads will automatically register here.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((b) => (
                  <tr key={b._id || b.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#102A2E]">{b.bookingId || 'BKG-DEAL'}</div>
                      <div className="text-[11px] text-gray-400">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'Recent'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#102A2E]">{b.customerName || b.clientName || 'Client'}</div>
                      <div className="text-[11px] text-gray-400">{b.customerPhone || b.clientPhone || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-800">
                      <div>{b.projectName || 'Township Project'}</div>
                      <div className="text-[11px] text-teal-700 font-semibold">Plot {b.plotNumber || 'Unit'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-extrabold text-gray-900">
                      {formatCurrency(b.totalAmount || b.dealValue)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-black text-[#0F766E]">
                      {formatCurrency(b.agentCommissionAmount)}
                      <div className="text-[10px] text-gray-400 font-normal">Status: {b.agentCommissionStatus || 'Pending'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        b.status === 'Approved' || b.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {b.status === 'Approved' || b.status === 'Confirmed' ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> : <HiOutlineClock className="w-3.5 h-3.5" />}
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleInspectBooking(b)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                      >
                        Details
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

