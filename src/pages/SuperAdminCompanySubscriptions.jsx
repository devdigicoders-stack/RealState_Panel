import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { 
  HiOutlineCreditCard, 
  HiOutlineOfficeBuilding, 
  HiOutlineSearch, 
  HiOutlineFilter,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const SuperAdminCompanySubscriptions = () => {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Fetch from Live MongoDB APIs
  const fetchSubscriptionsData = async () => {
    setIsLoading(true);
    try {
      const [compsRes, plansRes] = await Promise.all([
        superAdminService.getCompanies(),
        superAdminService.getPlans()
      ]);

      if (compsRes && compsRes.success && Array.isArray(compsRes.data)) {
        setCompanies(compsRes.data.map(c => ({
          ...c,
          id: c._id || c.id
        })));
      }

      if (plansRes && plansRes.success && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data.map(p => ({
          ...p,
          id: p._id || p.id
        })));
      }
    } catch (err) {
      console.error('Failed to load subscriptions mapping:', err);
      toast.error('Failed to fetch subscriptions data from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const filtered = companies.filter((c) => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlanFilter === 'All' || c.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const handleChangePlan = (company) => {
    const planOptions = {};
    plans.forEach(p => {
      planOptions[p.name] = `${p.name} (₹${(p.price || 0).toLocaleString('en-IN')}/${p.duration || 'mo'})`;
    });

    Swal.fire({
      title: `Change Plan Tier`,
      text: `Update subscription package for ${company.name}?`,
      input: 'select',
      inputOptions: planOptions,
      inputValue: company.plan,
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Update Subscription Tier'
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        const targetPlan = plans.find(p => p.name === res.value);
        try {
          const updatePayload = {
            plan: res.value,
            planPrice: `₹${(targetPlan?.price || 14999).toLocaleString('en-IN')}/mo`,
            usersLimit: targetPlan?.userLimit || company.usersLimit,
            projectsLimit: targetPlan?.projectLimit || company.projectsLimit
          };

          await superAdminService.updateCompany(company.id || company._id, updatePayload);
          toast.success(`Subscription upgraded to ${res.value} for ${company.name}!`);
          fetchSubscriptionsData();
        } catch (err) {
          toast.error(err.message || 'Failed to update subscription');
        }
      }
    });
  };

  return (
    <MainLayout title="Company Subscriptions Mapping">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Active Subscriptions Mapping</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live mapping of which real estate tenant is mapped to which SaaS plan tier in MongoDB.
            </p>
          </div>

          <button
            onClick={fetchSubscriptionsData}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>

        {/* Top Highlights per Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Subscriptions</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{companies.length} Companies</div>
            <p className="text-[10px] text-gray-500 mt-1">Across live SaaS tiers</p>
          </div>

          {plans.map((p) => {
            const count = companies.filter(c => (c.plan || '').toLowerCase().includes((p.name || '').toLowerCase().split(' ')[0])).length;
            return (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-[#0F766E] truncate block">{p.name}</span>
                <div className="text-2xl font-black text-[#102A2E] mt-1">{count} Active</div>
                <p className="text-[10px] text-gray-500 mt-1">₹{(p.price || 0).toLocaleString('en-IN')}/mo</p>
              </div>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search company, owner or email..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Filter By Plan:</span>
            <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold whitespace-nowrap">
              <button
                onClick={() => {
                  setSelectedPlanFilter('All');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedPlanFilter === 'All' ? 'bg-white text-[#102A2E] shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                All Tiers
              </button>
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlanFilter(p.name);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    selectedPlanFilter === p.name ? 'bg-white text-[#102A2E] shadow-xs font-bold' : 'text-gray-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table: Which Company is on which Plan */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={8} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 whitespace-nowrap min-w-[1000px]">
                <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Company Name</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Owner / Admin Email</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Subscribed Plan Tier</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Pricing</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Subscribed On</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Expiry Date</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Renewals</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Manage Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filtered.length > 0 ? (
                    filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {c.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-extrabold text-[#102A2E] text-xs whitespace-nowrap">{c.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-800 text-xs">{c.ownerName}</div>
                          <div className="text-gray-400 text-[11px]">{c.email}</div>
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

                        <td className="py-3.5 px-4 font-black text-[#0F766E] text-xs whitespace-nowrap">
                          {c.planPrice || '₹14,999/mo'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-800 text-xs">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                          </div>
                          <div className="text-[10px] text-gray-400">Initial start</div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-800 whitespace-nowrap">
                          <span className={c.status === 'Expired' ? 'text-red-600 font-bold' : ''}>
                            {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'Active validity'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[10px] bg-emerald-50 text-[#0F766E] px-2.5 py-1 rounded-md border border-emerald-100 whitespace-nowrap">
                            {c.renewalCount || 0} Times
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleChangePlan(c)}
                            className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl transition-colors text-[11px] cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            Change Plan Tier
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-400">
                        No company subscriptions found matching your criteria.
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
