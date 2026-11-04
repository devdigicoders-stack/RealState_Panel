import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { BookingModal } from '../../components/company/BookingModal';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineBookmark,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCurrencyRupee,
  HiOutlinePrinter,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompanyAdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingApproval: 0,
    approvedUnits: 0,
    approvedVolume: '₹0.00 Cr',
    totalTokenCollected: '₹0'
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getBookings({
        search: searchTerm,
        status: statusFilter,
        page: 1,
        limit: 100
      });
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
        if (res.stats) setStats(res.stats);
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

  const handleCreateBooking = () => {
    setSelectedBooking(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditBooking = (bk) => {
    setSelectedBooking(bk);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewBooking = (bk) => {
    setSelectedBooking(bk);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveBooking = async (bData) => {
    try {
      if (modalMode === 'edit' && selectedBooking) {
        const id = selectedBooking._id || selectedBooking.id;
        const res = await companyAdminService.updateBooking(id, bData);
        if (res.success) {
          toast.success(res.message || 'Booking updated successfully!');
          fetchBookings();
        }
      } else {
        const res = await companyAdminService.createBooking(bData);
        if (res.success) {
          toast.success(res.message || 'Booking registered successfully!');
          fetchBookings();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save booking');
    }
  };

  const handleApprove = async (id, bookingNo) => {
    try {
      const res = await companyAdminService.updateBooking(id, { status: 'Approved' });
      if (res.success) {
        toast.success(`Booking ${bookingNo} Approved!`);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleDelete = (id, bookingNo) => {
    Swal.fire({
      title: `Delete Booking ${bookingNo}?`,
      text: 'Are you sure you want to remove this booking from MongoDB?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deleteBooking(id);
          if (res.success) {
            toast.info(`Booking ${bookingNo} removed`);
            fetchBookings();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete booking');
        }
      }
    });
  };

  const filtered = bookings.filter(b => {
    const custMatch = (b.customer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (b.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const projMatch = (b.project || '').toLowerCase().includes(searchTerm.toLowerCase());
    const plotMatch = (b.plotNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = custMatch || phoneMatch || projMatch || plotMatch;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedBookings = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Plot  Bookings, Customer   & Approvals">
      
      {/* Top Banner Booking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Bookings</span>
          <div className="text-xl font-black text-[#102A2E] mt-0.5">{stats.totalBookings || bookings.length} Units</div>
          <p className="text-[10px] text-gray-500 font-semibold">Registered tokens</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-[#D6A84B] uppercase">Pending Approval</span>
          <div className="text-xl font-black text-[#D6A84B] mt-0.5">{stats.pendingApproval} Units</div>
          <p className="text-[10px] text-amber-600 font-semibold">Awaiting Owner clearance</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-[#0F766E] uppercase">Approved Units</span>
          <div className="text-xl font-black text-[#0F766E] mt-0.5">{stats.approvedUnits} Units</div>
          <p className="text-[10px] text-emerald-600 font-semibold">{stats.approvedVolume} Volume</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Token Realized</span>
          <div className="text-xl font-black text-blue-600 mt-0.5">{stats.totalTokenCollected}</div>
          <p className="text-[10px] text-blue-600 font-semibold">Cleared in Company Escrow</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Customer Plot Bookings Management</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({bookings.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner oversees token advances, discounts, executive allocations, and approval authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleCreateBooking}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Create New Booking</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client, plot #, booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold text-gray-700"
          >
            <option value="All">All Bookings</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live bookings...</p>
        </div>
      ) : paginatedBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineBookmark className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Bookings Found</p>
          <p className="text-xs text-gray-400 mt-1">Register customer plot booking tokens to track.</p>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Client & Contact</th>
                  <th className="py-3 px-4">Target Unit / Township</th>
                  <th className="py-3 px-4">Plot Value & Token</th>
                  <th className="py-3 px-4">Sales Executive</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedBookings.map((b) => (
                  <tr key={b._id || b.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      <span className="bg-gray-100 px-2 py-0.5 rounded border">{b.id || b.bookingId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#102A2E] text-xs">{b.customer}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{b.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{b.plotNo}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{b.project}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{b.totalPlotValue}</div>
                      <div className="text-[10px] text-[#0F766E] font-bold mt-0.5">Token: {b.tokenAmount}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-800">{b.salesExec}</td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        b.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        ● {b.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(b._id || b.id, b.id || b.bookingId)}
                            className="px-2 py-1 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            title="Approve Booking"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleViewBooking(b)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(b)}
                          className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                          title="Edit Booking"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id || b.id, b.id || b.bookingId)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Booking"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBooking}
        booking={selectedBooking}
        mode={modalMode}
      />

    </MainLayout>
  );
};

export default CompanyAdminBookings;
