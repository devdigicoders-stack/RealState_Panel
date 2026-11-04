import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { PlanFormModal } from '../components/PlanFormModal';
import { Pagination } from '../components/common/Pagination';
import { superAdminService } from '../services/superAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlinePlus,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineViewList,
  HiOutlineViewGrid,
  HiOutlineEye,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Live Plans & Companies from Backend MongoDB
  const fetchPlansAndData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, companiesRes] = await Promise.all([
        superAdminService.getPlans(),
        superAdminService.getCompanies()
      ]);

      if (plansRes && plansRes.success && Array.isArray(plansRes.data)) {
        const normalizedPlans = plansRes.data.map(p => ({
          ...p,
          id: p._id || p.id,
          userLimit: p.userLimit || 10,
          projectLimit: p.projectLimit || 5,
          features: Array.isArray(p.features) ? p.features : []
        }));
        setPlans(normalizedPlans);
      }

      if (companiesRes && companiesRes.success && Array.isArray(companiesRes.data)) {
        setCompanies(companiesRes.data.map(c => ({
          ...c,
          id: c._id || c.id
        })));
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      toast.error('Unable to fetch plans from backend API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansAndData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleOpenPlanCompanies = (plan) => {
    navigate(`/superadmin/plans/${plan.id || plan._id || plan.name}/companies`);
  };

  const handleRenewCompany = async (company) => {
    Swal.fire({
      title: `Renew License: ${company.name}`,
      text: `Grant 1-year validity extension for ${company.name} under ${company.plan}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, Renew Now'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await superAdminService.renewCompanyLicense(company.id || company._id);
          toast.success(`License renewed successfully for ${company.name}!`);
          fetchPlansAndData();
        } catch (err) {
          toast.error(err.message || 'Renewal failed');
        }
      }
    });
  };

  const handleSavePlan = async (planData) => {
    const targetId = editingPlan?.id || editingPlan?._id;
    if (targetId) {
      try {
        const res = await superAdminService.updatePlan(targetId, planData);
        if (res && res.success) {
          toast.success(`Plan "${planData.name}" updated successfully!`);
          fetchPlansAndData();
        }
      } catch (err) {
        toast.error(err.message || 'Failed to update plan');
      }
    } else {
      try {
        const res = await superAdminService.createPlan(planData);
        if (res && res.success) {
          toast.success(`New subscription plan "${planData.name}" created and published!`);
          fetchPlansAndData();
        }
      } catch (err) {
        toast.error(err.message || 'Failed to create plan');
      }
    }
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = async (planId, planName) => {
    Swal.fire({
      title: `Delete ${planName}?`,
      text: 'Are you sure you want to remove this subscription plan tier from MongoDB?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete Plan'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await superAdminService.deletePlan(planId);
          toast.success(`Plan "${planName}" removed from database`);
          fetchPlansAndData();
        } catch (err) {
          toast.error(err.message || 'Failed to delete plan');
        }
      }
    });
  };

  // Helper to count registered companies per plan dynamically
  const getSubscribedCompaniesCount = (planName) => {
    return companies.filter(c => {
      return (c.plan?.toLowerCase() === planName?.toLowerCase()) ||
             (planName === 'Enterprise Elite' && c.plan?.includes('Enterprise')) ||
             (planName === 'Standard Growth' && (c.plan?.includes('Standard') || c.plan?.includes('Growth'))) ||
             (planName === 'Starter Plan' && c.plan?.includes('Starter'));
    }).length;
  };

  // Pagination logic
  const totalPages = Math.ceil(plans.length / itemsPerPage) || 1;
  const paginatedPlans = plans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Subscription Plans Management">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Configured Plans</span>
          <div className="text-2xl font-black text-[#102A2E] mt-1">{plans.length} Tiers</div>
          <p className="text-[10px] text-gray-500 mt-1">Multi-tenant packages in MongoDB</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#0F766E] uppercase">Starting Price</span>
          <div className="text-2xl font-black text-[#0F766E] mt-1">
            {plans.length > 0 ? `₹${Math.min(...plans.map(p => Number(p.price) || 0)).toLocaleString('en-IN')}/mo` : '₹0/mo'}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {plans.length > 0 ? 'Lowest Configured Tier' : 'No Plans Configured'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Top Enterprise Plan</span>
          <div className="text-2xl font-black text-[#D6A84B] mt-1">
            {plans.length > 0 ? `₹${Math.max(...plans.map(p => Number(p.price) || 0)).toLocaleString('en-IN')}/mo` : '₹0/mo'}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {plans.length > 0 ? 'Highest Configured Tier' : 'No Plans Configured'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Total Tenant Companies</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{companies.length} Tenants</div>
          <p className="text-[10px] text-gray-500 mt-1">Across all live subscriptions</p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">SaaS Plan Packages & Tier Pricing</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Define pricing, user seats, project capacity, and click <strong>"View Companies"</strong> to audit subscribed companies, status, expirations & renewal history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlansAndData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Reload from Database"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <HiOutlineViewList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Pricing Cards View"
            >
              <HiOutlineViewGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" /> Create New Plan
          </button>
        </div>
      </div>

      {/* Main View: Table Mode vs Cards Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                  <th className="py-3.5 px-4 whitespace-nowrap">Plan Name & Badge</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Pricing & Cycle</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Allocated Quotas</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Active Tenants</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Included Features</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedPlans.length > 0 ? (
                  paginatedPlans.map((plan) => {
                    const enrolledCount = getSubscribedCompaniesCount(plan.name);
                    return (
                      <tr key={plan.id} className="hover:bg-gray-50/60 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold shrink-0">
                              <HiOutlineCreditCard className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#102A2E] text-xs whitespace-nowrap">{plan.name}</span>
                              {plan.isPopular && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                                  <HiOutlineSparkles className="w-2.5 h-2.5" /> Popular
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-sm font-black text-[#102A2E]">
                            ₹{plan.price ? Number(plan.price).toLocaleString('en-IN') : '0'}
                          </span>
                          <span className="text-gray-400 text-[10px] ml-1">/{plan.duration || 'Monthly'}</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 text-[11px] whitespace-nowrap">
                            <span className="text-gray-600">
                              Users: <strong className="text-gray-900">{plan.userLimit} Seats</strong>
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600">
                              Projects: <strong className="text-gray-900">{plan.projectLimit} Active</strong>
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0F766E] font-extrabold text-[11px] border border-emerald-200 whitespace-nowrap">
                              {enrolledCount} Companies
                            </span>
                            <button
                              onClick={() => handleOpenPlanCompanies(plan)}
                              className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                              title="Audit subscribed companies"
                            >
                              <HiOutlineEye className="w-3.5 h-3.5" /> View
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            {plan.features?.slice(0, 2).map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium whitespace-nowrap">
                                {f}
                              </span>
                            ))}
                            {plan.features?.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-400 text-[10px] whitespace-nowrap">
                                +{plan.features.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEdit(plan)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] transition-colors cursor-pointer"
                              title="Edit Plan"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id, plan.name)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Plan"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      No subscription plans found in database. Click "Create New Plan" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {plans.length > itemsPerPage && (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={plans.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Cards View Mode */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const enrolledCount = getSubscribedCompaniesCount(plan.name);
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all hover:shadow-lg ${
                  plan.isPopular ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20' : 'border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0F766E] text-white shadow-xs">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#102A2E]">{plan.name}</h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0F766E] font-bold text-[10px] border border-emerald-200">
                      {enrolledCount} Tenants
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-[#102A2E]">
                      ₹{plan.price ? Number(plan.price).toLocaleString('en-IN') : '0'}
                    </span>
                    <span className="text-gray-400 text-xs ml-1.5">/{plan.duration || 'Monthly'}</span>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Staff Seats:</span>
                      <span className="font-bold text-[#102A2E]">{plan.userLimit} Users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project Capacity:</span>
                      <span className="font-bold text-[#102A2E]">{plan.projectLimit} Projects</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      Included Features:
                    </span>
                    {plan.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <HiOutlineCheckCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenPlanCompanies(plan)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#0F766E]/10 text-gray-700 hover:text-[#0F766E] text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <HiOutlineEye className="w-3.5 h-3.5" /> Subscribed ({enrolledCount})
                  </button>
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] transition-all"
                    title="Edit Plan"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
                    title="Delete Plan"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Form Modal (Create & Edit) */}
      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        planData={editingPlan}
      />
    </MainLayout>
  );
};
