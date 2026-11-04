import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  HiOutlineClock, 
  HiOutlineRefresh, 
  HiOutlineOfficeBuilding, 
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineCheckCircle
} from 'react-icons/hi';

export const SuperAdminRenewals = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const fetchRenewals = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getRenewals();
      if (res && res.success && Array.isArray(res.data)) {
        setCompanies(res.data.map(c => ({
          ...c,
          id: c._id || c.id
        })));
      }
    } catch (err) {
      console.error('Failed to load renewals:', err);
      toast.error('Failed to fetch renewals telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleRenew = (company) => {
    Swal.fire({
      title: `Renew Subscription: ${company.name}`,
      text: `Grant 1-year renewal extension for ${company.name} under ${company.plan}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, Renew License'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await superAdminService.renewCompanyLicense(company.id || company._id);
          toast.success(`Subscription renewed successfully for ${company.name}!`);
          fetchRenewals();
        } catch (err) {
          toast.error(err.message || 'Renewal failed');
        }
      }
    });
  };

  const filtered = companies.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.plan || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = companies.filter(c => c.status === 'Active').length;
  const expiredCount = companies.filter(c => c.status === 'Expired' || c.status === 'Suspended').length;

  return (
    <MainLayout title="Plan Expiry & Renewal Management">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">License Validity & Renewals Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live tracking of company license expirations, renewal extensions, and SaaS uptime SLAs in MongoDB.
            </p>
          </div>

          <button
            onClick={fetchRenewals}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>

        {/* Top Banner Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Subscribed Companies</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{companies.length} Tenants</div>
            <p className="text-[10px] text-gray-500 mt-1">SaaS ecosystem</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Healthy / Active Licenses</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{activeCount} Companies</div>
            <p className="text-[10px] text-gray-500 mt-1">Uptime SLA 99.98%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-red-500 uppercase">Expired / Pending Renewals</span>
            <div className="text-2xl font-black text-red-600 mt-1">{expiredCount} Companies</div>
            <p className="text-[10px] text-gray-500 mt-1">Requires immediate license action</p>
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
              placeholder="Search company, email, or plan..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {filtered.length} companies
          </span>
        </div>

        {/* Renewals Table */}
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
                    <th className="py-3.5 px-4 whitespace-nowrap">Company Details</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Subscribed Plan</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Current Expiry Date</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Renewal Count</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Last Renewed</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">License Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filtered.length > 0 ? (
                    filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              <HiOutlineOfficeBuilding className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-extrabold text-[#102A2E] text-xs block whitespace-nowrap">{c.name}</span>
                              <span className="text-gray-400 text-[11px] whitespace-nowrap">{c.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap ${
                            (c.plan || '').includes('Enterprise')
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : (c.plan || '').includes('Standard')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {c.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-800 whitespace-nowrap">
                          <span className={c.status === 'Expired' ? 'text-red-600 font-black' : ''}>
                            {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'Active validity'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100 whitespace-nowrap">
                            {c.renewalCount || 0} Times Renewed
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {c.lastRenewedAt ? new Date(c.lastRenewedAt).toLocaleString('en-IN') : 'Initial Term'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            c.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleRenew(c)}
                            className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl transition-all text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                          >
                            <HiOutlineRefresh className="w-3.5 h-3.5" /> Renew 1-Year
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No renewals records found matching search.
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
    </MainLayout>
  );
};
