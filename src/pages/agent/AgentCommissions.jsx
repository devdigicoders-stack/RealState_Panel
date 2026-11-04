import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { agentService } from '../../services/agentService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCash,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineCurrencyRupee
} from 'react-icons/hi';

export const AgentCommissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [commissions, setCommissions] = useState([]);
  const [totals, setTotals] = useState({
    totalEarned: 0,
    paidCommission: 0,
    approvedCommission: 0,
    pendingCommission: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const res = await agentService.getMyCommissions();
      if (res && res.success) {
        setCommissions(res.data || []);
        if (res.totals) {
          setTotals(res.totals);
        }
      }
    } catch (err) {
      console.error('Failed to load commissions', err);
      toast.error('Failed to load commissions data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  const filtered = commissions.filter((c) => {
    const matchesSearch =
      (c.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.plotNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.bookingId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleInspectVoucher = (deal) => {
    Swal.fire({
      title: `Commission Voucher: ${deal.bookingId || 'BKG-DEAL'}`,
      html: `
        <div class="text-left text-xs space-y-2 p-3 bg-gray-50 rounded-xl">
          <p><strong>Customer:</strong> ${deal.customerName || 'N/A'} (${deal.customerPhone || 'N/A'})</p>
          <p><strong>Project & Unit:</strong> ${deal.projectName || ''} - Plot ${deal.plotNumber || 'N/A'}</p>
          <p><strong>Gross Deal Valuation:</strong> ${formatCurrency(deal.dealValue)}</p>
          <p><strong>Commission Rate:</strong> ${deal.commissionRate || '2.0%'}</p>
          <p><strong>Gross Brokerage:</strong> <span class="font-bold text-[#0F766E]">${formatCurrency(deal.commissionAmount)}</span></p>
          <p><strong>TDS (5% Section 194H):</strong> ${formatCurrency(deal.tdsDeduction)}</p>
          <p><strong>Net Payout Payable:</strong> <strong class="text-emerald-700 font-bold">${formatCurrency(deal.netPayable)}</strong></p>
          <p><strong>Payment Status:</strong> <span class="font-bold">${deal.status || 'Pending'}</span></p>
          ${deal.transactionRef ? `<p><strong>Txn Ref:</strong> ${deal.transactionRef}</p>` : ''}
        </div>
      `,
      confirmButtonText: 'Print Voucher',
      showCancelButton: true,
      cancelButtonText: 'Close',
      confirmButtonColor: '#0F766E'
    }).then((res) => {
      if (res.isConfirmed) {
        toast.success(`Digital payment voucher sent to your registered email!`);
      }
    });
  };

  return (
    <MainLayout title="Channel Partner Commission & Brokerage Ledger">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Total Commission</span>
            <HiOutlineCurrencyRupee className="w-5 h-5 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-black text-[#0F766E] mt-2">{formatCurrency(totals.totalEarned)}</div>
          <p className="text-[11px] text-gray-500 mt-1">Across all confirmed deal bookings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Disbursed / Paid</span>
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#102A2E] mt-2">{formatCurrency(totals.paidCommission)}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Direct Bank Account Transfer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Approved Payout</span>
            <HiOutlineClock className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 mt-2">{formatCurrency(totals.approvedCommission)}</div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">Ready for next payout cycle</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Pending Token Clearance</span>
            <HiOutlineClock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{formatCurrency(totals.pendingCommission)}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting registry clearance</p>
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
            placeholder="Search by customer, booking ID, plot number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Paid', 'Approved', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A2E] text-white font-semibold">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Booking ID / Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Customer / Plot</th>
                <th className="py-3 px-4 whitespace-nowrap">Deal Valuation</th>
                <th className="py-3 px-4 whitespace-nowrap">Gross Commission</th>
                <th className="py-3 px-4 whitespace-nowrap">Net Payable</th>
                <th className="py-3 px-4 whitespace-nowrap">Payout Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <TableSkeleton rows={4} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    <p className="font-semibold text-gray-600">No commission payouts found.</p>
                    <p className="text-xs text-gray-400 mt-1">Bookings confirmed under your agent identity will be computed and listed here.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((comm) => (
                  <tr key={comm.bookingId || comm._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#102A2E]">{comm.bookingId || 'BKG-DEAL'}</div>
                      <div className="text-[11px] text-gray-400">{comm.bookingDate ? new Date(comm.bookingDate).toLocaleDateString('en-IN') : 'Recent'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-800">{comm.customerName}</div>
                      <div className="text-[11px] text-gray-500">
                        {comm.projectName ? `${comm.projectName} - ` : ''}Plot {comm.plotNumber || 'Unit'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-800">
                      {formatCurrency(comm.dealValue)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-[#0F766E]">{formatCurrency(comm.commissionAmount)}</div>
                      <div className="text-[10px] text-gray-400">Rate: {comm.commissionRate || '2.0%'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-extrabold text-emerald-700">
                      {formatCurrency(comm.netPayable)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        comm.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : comm.status === 'Approved'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {comm.status === 'Paid' ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> : <HiOutlineClock className="w-3.5 h-3.5" />}
                        {comm.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleInspectVoucher(comm)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                      >
                        Voucher
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
      {!isLoading && filtered.length > 0 && (
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
