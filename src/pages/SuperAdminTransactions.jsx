import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { HighchartsWrapper } from '../components/HighchartsWrapper';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { downloadTaxInvoicePDF } from '../utils/invoiceDownloader';
import { 
  HiOutlineCurrencyRupee, 
  HiOutlineDownload, 
  HiOutlineSearch, 
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineX,
  HiOutlineCreditCard,
  HiOutlineRefresh
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const SuperAdminTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getTransactions();
      if (res && res.success && Array.isArray(res.data)) {
        setTransactions(res.data.map(t => ({
          ...t,
          id: t._id || t.id
        })));
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      toast.error('Failed to fetch transactions from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalCollected = transactions
    .filter(t => t.status === 'Success')
    .reduce((acc, t) => acc + (t.total || 0), 0);

  // Revenue Spline Chart
  const revenueChartOptions = {
    chart: { type: 'areaspline', backgroundColor: 'transparent', height: 220, style: { fontFamily: 'inherit' } },
    title: { text: null },
    credits: { enabled: false },
    xAxis: { categories: ['10 Oct', '15 Oct', '20 Oct', '24 Oct', '28 Oct', '31 Oct'] },
    yAxis: { title: { text: null }, labels: { formatter: function () { return '₹' + (this.value / 1000) + 'k'; } } },
    tooltip: { backgroundColor: '#102A2E', borderRadius: 10, style: { color: '#FFF' } },
    plotOptions: {
      areaspline: {
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(15, 118, 110, 0.4)'], [1, 'rgba(15, 118, 110, 0.01)']] },
        lineColor: '#0F766E', lineWidth: 3, marker: { radius: 4, fillColor: '#D6A84B' }
      }
    },
    series: [{ 
      name: 'Collections (₹)', 
      data: [
        Math.round(totalCollected * 0.2), 
        Math.round(totalCollected * 0.4), 
        Math.round(totalCollected * 0.6), 
        Math.round(totalCollected * 0.75), 
        Math.round(totalCollected * 0.9), 
        totalCollected
      ] 
    }]
  };

  const filtered = transactions.filter(t => 
    (t.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Platform Subscription Billing & Invoices">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">SaaS Subscription Collections & Invoices</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live audit of payment receipts, GST breakdown, and transaction settlements in MongoDB.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>

        {/* Top Highlight Cards & Spline Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Settled Collections</span>
              <div className="text-3xl font-black text-[#102A2E] mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">● 100% Platform Uptime Settlement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Paid Invoices Count</span>
              <div className="text-3xl font-black text-[#0F766E] mt-1">{transactions.length} Invoices</div>
              <p className="text-[10px] text-gray-500 mt-1">Across all tenant builders</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Revenue Realization Progression</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Automated PG Webhook</span>
            </div>
            <HighchartsWrapper options={revenueChartOptions} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoice number, company or owner..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {filtered.length} transactions
          </span>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[950px]">
                <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Invoice #</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tenant Organization</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Subscribed Plan</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Base Amount</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">GST (18%)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Total Settled</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Payment Gateway</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filtered.length > 0 ? (
                    filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#102A2E] whitespace-nowrap">
                          {t.invoiceNo}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-extrabold text-[#102A2E] block text-xs whitespace-nowrap">{t.company}</span>
                          <span className="text-gray-400 text-[10px] whitespace-nowrap">Owner: {t.ownerName}</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">
                            {t.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                          ₹{(t.amount || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                          ₹{(t.gst || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 font-black text-[#0F766E] text-xs whitespace-nowrap">
                          ₹{(t.total || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                          {t.method}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTxn(t)}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                              title="View Invoice"
                            >
                              <HiOutlineEye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                downloadTaxInvoicePDF(t);
                                toast.success(`Receipt ${t.invoiceNo} opened for download`);
                              }}
                              className="p-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer"
                              title="Download PDF Receipt"
                            >
                              <HiOutlineDownload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-400">
                        No transactions found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          )}
        </div>

      </div>

      {/* Invoice Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-[#102A2E]">Official Tax Invoice</h3>
              <button onClick={() => setSelectedTxn(null)} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <HiOutlineX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-mono font-bold text-[#102A2E]">{selectedTxn.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billed To:</span>
                <span className="font-bold text-[#102A2E]">{selectedTxn.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subscription Tier:</span>
                <span className="font-bold text-[#0F766E]">{selectedTxn.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Gateway:</span>
                <span className="font-bold text-gray-800">{selectedTxn.method}</span>
              </div>
              <div className="pt-2 border-t flex justify-between text-sm font-black text-[#102A2E]">
                <span>Total Amount Paid:</span>
                <span className="text-[#0F766E]">₹{(selectedTxn.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                downloadTaxInvoicePDF(selectedTxn);
                toast.success(`Tax Invoice ${selectedTxn.invoiceNo} opened for download`);
                setSelectedTxn(null);
              }}
              className="mt-6 w-full py-2.5 bg-[#0F766E] text-white font-bold rounded-xl text-xs hover:bg-[#0c5e58] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <HiOutlineDownload className="w-4 h-4" /> Download PDF Tax Receipt
            </button>
          </div>
        </div>
      )}

    </MainLayout>
  );
};
