import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { superAdminService } from '../services/superAdminService';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineCurrencyRupee
} from 'react-icons/hi';

export const PlanCompaniesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPlanAndCompanies = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Plan Details & Companies enrolled
      const [plansRes, compsRes] = await Promise.all([
        superAdminService.getPlans(),
        superAdminService.getCompanies()
      ]);

      let foundPlan = null;
      if (plansRes && plansRes.success && Array.isArray(plansRes.data)) {
        foundPlan = plansRes.data.find(p => (p._id === id || p.id === id || p.name === id));
      }

      setPlan(foundPlan);

      if (compsRes && compsRes.success && Array.isArray(compsRes.data)) {
        // Filter companies enrolled in this plan
        const planName = foundPlan ? foundPlan.name : id;
        const matchingComps = compsRes.data.filter((c) => {
          if (!c) return false;
          return (c.plan?.toLowerCase() === planName?.toLowerCase()) ||
                 (planName?.includes('Enterprise') && c.plan?.includes('Enterprise')) ||
                 (planName?.includes('Standard') && (c.plan?.includes('Standard') || c.plan?.includes('Growth'))) ||
                 (planName?.includes('Starter') && c.plan?.includes('Starter'));
        }).map(c => ({
          ...c,
          id: c._id || c.id
        }));

        setCompanies(matchingComps);
      }
    } catch (err) {
      console.error('Failed to load plan companies:', err);
      toast.error('Failed to load companies for this plan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanAndCompanies();
  }, [id]);

  const handleRenewCompany = (company) => {
    Swal.fire({
      title: `Renew License: ${company.name}`,
      text: `Grant 1-year validity extension for ${company.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, Renew Now'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await superAdminService.renewCompanyLicense(company.id || company._id);
          toast.success(`License renewed successfully for ${company.name}!`);
          fetchPlanAndCompanies();
        } catch (err) {
          toast.error(err.message || 'Renewal failed');
        }
      }
    });
  };

  const filteredCompanies = companies.filter((c) => {
    const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = companies.filter(c => c.status === 'Active').length;
  const expiredCount = companies.filter(c => c.status === 'Expired' || c.status === 'Suspended').length;
  const planPriceNumber = Number(plan?.price) || 0;
  const totalMRR = activeCount * planPriceNumber;

  return (
    <MainLayout title="Plan Subscribed Companies">
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/superadmin/plans')}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-[#102A2E] hover:bg-gray-50 shadow-xs transition-all cursor-pointer"
              title="Back to Subscription Plans"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Subscribed Tenants Audit</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-mono">Plan: {plan?.name || id}</span>
              </div>
              <h1 className="text-2xl font-black text-[#102A2E] tracking-tight">
                {plan?.name || 'Subscription Tier Audit'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPlanAndCompanies}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              to="/superadmin/companies"
              className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <HiOutlineOfficeBuilding className="w-4 h-4" /> All Companies
            </Link>
          </div>
        </div>

        {/* Plan Header Card Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#102A2E] via-[#0E353A] to-[#0F766E] text-white shadow-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D6A84B] text-[#102A2E] flex items-center justify-center font-black shadow-lg shrink-0">
              <HiOutlineCreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">{plan?.name || 'Standard Tier'}</h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-[#D6A84B] text-[#102A2E]">
                  ₹{planPriceNumber.toLocaleString('en-IN')}/{plan?.duration || 'Monthly'}
                </span>
                {plan?.isPopular && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                    <HiOutlineSparkles className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/80 mt-1">
                Subscribed Tenant Companies Audit • Validity, Expirations, Renewal History & Limits
              </p>
            </div>
          </div>
        </div>

        {/* KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Subscribed</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{companies.length} Companies</div>
            <p className="text-[10px] text-gray-500 mt-1">Live platform tenants</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Active Licenses</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{activeCount} Tenants</div>
            <p className="text-[10px] text-gray-500 mt-1">Within valid validity window</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-red-500 uppercase">Expired Licenses</span>
            <div className="text-2xl font-black text-red-600 mt-1">{expiredCount} Tenants</div>
            <p className="text-[10px] text-gray-500 mt-1">Needs immediate renewal</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Estimated Plan MRR</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">₹{totalMRR.toLocaleString('en-IN')}</div>
            <p className="text-[10px] text-gray-500 mt-1">Monthly recurring billing</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, admin name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <HiOutlineFilter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', 'Active', 'Expired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#102A2E] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Companies List Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={4} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    <th className="py-3.5 px-4 whitespace-nowrap">Company & Owner</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Subscribed On</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Expiry Date</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Renewal Count</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Last Renewed On</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#102A2E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {c.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="whitespace-nowrap">
                              <span className="font-bold text-[#102A2E] block whitespace-nowrap">{c.name}</span>
                              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                {c.ownerName} • {c.email}
                              </span>
                            </div>
                          </div>
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

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800 block whitespace-nowrap">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '01 Jan 2026'}
                          </span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">Initial registration</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800 block whitespace-nowrap">
                            {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'Active validity'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 whitespace-nowrap">
                            {c.renewalCount || 0} Times Renewed
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-gray-600 block text-[11px] whitespace-nowrap">
                            {c.lastRenewedAt ? new Date(c.lastRenewedAt).toLocaleString('en-IN') : 'Auto transaction'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleRenewCompany(c)}
                              className="px-2.5 py-1 rounded-lg bg-[#0F766E]/10 hover:bg-[#0F766E] text-[#0F766E] hover:text-white font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap"
                            >
                              Renew 1-Yr
                            </button>
                            <button
                              onClick={() => navigate(`/superadmin/companies/${c.id}`)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                              title="View Full Company Dossier"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No companies enrolled under this plan matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

