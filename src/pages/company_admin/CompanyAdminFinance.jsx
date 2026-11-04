import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { useAuth } from '../../context/AuthContext';
import { downloadCustomerReceiptPDF } from '../../utils/customerReceiptDownloader';
import { downloadCSV } from '../../utils/invoiceDownloader';
import { toast } from 'react-toastify';
import {
  HiOutlineCash,
  HiOutlineSearch,
  HiOutlineCreditCard,
  HiOutlinePrinter,
  HiOutlineDocumentReport,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineDownload,
  HiOutlineEye
} from 'react-icons/hi';

export const CompanyAdminFinance = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalCollected: '₹0.00 Cr',
    totalSalesVolume: '₹0.00 Cr',
    pendingClearance: '₹0.00'
  });

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getFinanceTransactions({ search: searchTerm });
      if (res.success && Array.isArray(res.data)) {
        setTransactions(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [searchTerm]);

  const filtered = transactions.filter(t =>
    (t.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.plot || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedTxns = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Escrow Ledger, Customer Receipts & Financial Realization">
      
      {/* Top Banner Finance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Gross Revenue Collected</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{stats.totalCollected}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Token & Installment clearances</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineCash className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#102A2E] uppercase">Total Sales Inventory Value</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{stats.totalSalesVolume}</div>
            <p className="text-[10px] text-gray-500 font-semibold mt-1">Approved bookings aggregate</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#102A2E] flex items-center justify-center font-bold">
            <HiOutlineCreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Pending Cheque Float</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">₹0.00 Float</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">All payments cleared in bank</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Financial Ledger & Payment Receipts</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({transactions.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner audits client payments, banking transaction IDs, digital receipts, and bank deposit realizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFinance}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={() => {
              if (transactions.length === 0) {
                toast.info('No transactions to export');
                return;
              }
              const csvRows = transactions.map(t => ({
                ReceiptNo: t.receiptNo || '',
                Customer: t.customer || '',
                Plot: t.plot || '',
                Category: t.type || '',
                Amount: t.amount || '',
                Mode: t.mode || '',
                Status: t.status || '',
                Date: t.date || ''
              }));
              downloadCSV(`Company_Finance_Ledger_${new Date().toISOString().slice(0, 10)}`, csvRows);
              toast.success('Finance Ledger CSV downloaded successfully!');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Export Ledger CSV"
          >
            <HiOutlineDownload className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, plot #, receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live financial records...</p>
        </div>
      ) : paginatedTxns.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineCash className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Transactions Found</p>
          <p className="text-xs text-gray-400 mt-1">Customer token advances and installment payments will appear here.</p>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Customer & Plot</th>
                  <th className="py-3 px-4">Payment Category</th>
                  <th className="py-3 px-4">Amount Realized</th>
                  <th className="py-3 px-4">Banking Gateway / Mode</th>
                  <th className="py-3 px-4">Clearance Status</th>
                  <th className="py-3 px-4 text-right">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      <span className="bg-gray-100 px-2 py-0.5 rounded border">{t.receiptNo}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#102A2E] text-xs">{t.customer}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.plot}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-800">{t.type}</td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F766E] text-sm">{t.amount}</span>
                    </td>

                    <td className="py-3 px-4 text-gray-600">{t.mode}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          downloadCustomerReceiptPDF(t, user?.companyName || user?.company?.name || 'Real Estate CRM');
                          toast.success(`Receipt ${t.receiptNo} downloaded`);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                        title="Download / Print PDF Receipt"
                      >
                        <HiOutlinePrinter className="w-3.5 h-3.5" /> Print Receipt
                      </button>
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

    </MainLayout>
  );
};

export default CompanyAdminFinance;
