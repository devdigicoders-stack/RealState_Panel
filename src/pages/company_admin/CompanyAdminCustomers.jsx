import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineCreditCard,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompanyAdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getCustomers({ search: searchTerm });
      if (res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.bookedUnit || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Verified Property Buyers & Plot Allottees">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Registered Customers</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{customers.length} Buyers</div>
            <p className="text-[10px] text-gray-500 mt-1">Token paid & confirmed buyers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">KYC Verified Profiles</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{customers.length} Cleared</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Aadhaar & PAN matched</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineCreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Deeds In-Process</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">Active Allotments</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Registry readiness</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center font-bold">
            <HiOutlineLocationMarker className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Confirmed Customer Directory</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({customers.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner oversees buyer KYC, allottee agreements, payment realizations, and balance dues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by buyer name, phone, unit..."
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
          <p className="text-xs font-bold text-gray-500 mt-3">Loading verified buyers from live database...</p>
        </div>
      ) : paginatedCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Customers Found</p>
          <p className="text-xs text-gray-400 mt-1">Approved bookings automatically populate customers here.</p>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Name & Contact</th>
                  <th className="py-3 px-4">Booked Plot Unit</th>
                  <th className="py-3 px-4">Unit Value</th>
                  <th className="py-3 px-4">Paid So Far</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Booking Stage</th>
                  <th className="py-3 px-4">KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedCustomers.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#102A2E] text-xs">{c.name}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{c.phone}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-800">{c.bookedUnit}</td>

                    <td className="py-3 px-4 font-bold text-gray-900">{c.unitValue}</td>

                    <td className="py-3 px-4 font-bold text-[#0F766E]">{c.paidSoFar}</td>

                    <td className="py-3 px-4 font-bold text-amber-700">{c.balanceDue}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● {c.stage}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {c.kycStatus}
                      </span>
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

export default CompanyAdminCustomers;
