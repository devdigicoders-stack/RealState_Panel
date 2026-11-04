import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { TableSkeleton } from '../components/Skeleton';
import { CompanyFormModal } from '../components/CompanyFormModal';
import { superAdminService } from '../services/superAdminService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineCheck,
  HiOutlineBan,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineOfficeBuilding,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompaniesMaster = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Fetch from Live MongoDB Backend API
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const [res, plansRes] = await Promise.all([
        superAdminService.getCompanies(),
        superAdminService.getPlans()
      ]);

      if (plansRes && plansRes.success && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data);
      }

      if (res && res.success && Array.isArray(res.data)) {
        // Map backend schema fields to frontend UI expected props
        const normalized = res.data.map((c) => ({
          ...c,
          id: c._id || c.id,
          maxUsers: c.usersLimit || c.maxUsers || 15,
          usersCount: typeof c.usersCount === 'number' ? c.usersCount : 0,
          maxProjects: c.projectsLimit || c.maxProjects || 5,
          projectsCount: typeof c.projectsCount === 'number' ? c.projectsCount : 0,
          storageQuota: c.storageQuota || '50 GB',
          storageUsed: c.storageUsed || '0 GB',
          joinedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'
        }));
        setCompanies(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch companies from backend:', err);
      toast.error('Failed to load registered companies from API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) => {
    const nameMatch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const ownerMatch = (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || ownerMatch || emailMatch;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedCompanies = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = async (companyId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
    Swal.fire({
      title: `${nextStatus === 'Active' ? 'Activate' : 'Deactivate'} Company Tenant?`,
      text: `Are you sure you want to mark this company as ${nextStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: nextStatus === 'Active' ? '#0F766E' : '#d33',
      confirmButtonText: `Yes, ${nextStatus}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await superAdminService.toggleCompanyStatus(companyId, nextStatus);
          setCompanies(
            companies.map((c) =>
              c.id === companyId ? { ...c, status: nextStatus } : c
            )
          );
          toast.success(`Company status updated to ${nextStatus}`);
        } catch (err) {
          toast.error(err.message || 'Failed to update company status');
        }
      }
    });
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    Swal.fire({
      title: 'Delete Tenant Account?',
      text: `This will permanently remove ${companyName} and all associated data from MongoDB.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete Permanently'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await superAdminService.deleteCompany(companyId);
          setCompanies(companies.filter((c) => c.id !== companyId));
          toast.success(`${companyName} deleted successfully`);
        } catch (err) {
          toast.error(err.message || 'Failed to delete company');
        }
      }
    });
  };

  const getPlanPrice = (planName) => {
    const matched = plans.find(p => p.name?.toLowerCase() === planName?.toLowerCase());
    if (matched) return `₹${Number(matched.price).toLocaleString('en-IN')}/mo`;
    return '₹0/mo';
  };

  const handleSaveCompany = async (formData) => {
    if (editingCompany) {
      try {
        const updatePayload = {
          name: formData.name,
          ownerName: formData.ownerName,
          phone: formData.phone,
          password: formData.password || undefined,
          plan: formData.plan,
          planPrice: getPlanPrice(formData.plan),
          status: formData.status || 'Active',
          usersLimit: Number(formData.maxUsers),
          projectsLimit: Number(formData.maxProjects),
          callingProvider: formData.callingProvider || formData.callingIntegration,
          smsProvider: formData.smsProvider
        };
        const targetId = editingCompany.id || editingCompany._id;
        const res = await superAdminService.updateCompany(targetId, updatePayload);
        if (res && res.success) {
          toast.success(`Company "${formData.name}" updated successfully!`);
          fetchCompanies();
        }
      } catch (err) {
        toast.error(err.message || 'Failed to update company');
      }
    } else {
      try {
        const createPayload = {
          name: formData.name,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || 'password123',
          plan: formData.plan || plans[0]?.name || 'Standard Growth',
          planPrice: getPlanPrice(formData.plan || plans[0]?.name),
          maxUsers: Number(formData.maxUsers) || 15,
          maxProjects: Number(formData.maxProjects) || 5,
          callingProvider: formData.callingProvider || 'Exotel Cloud PBX',
          smsProvider: formData.smsProvider || 'Gupshup WhatsApp API'
        };

        const res = await superAdminService.createCompany(createPayload);
        if (res && res.success) {
          setIsFormModalOpen(false);
          setEditingCompany(null);
          await fetchCompanies();

          Swal.fire({
            title: 'Company Onboarded Successfully!',
            html: `
              <div class="text-left text-xs space-y-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <p><strong>Company:</strong> ${formData.name}</p>
                <p><strong>Owner Name:</strong> ${formData.ownerName}</p>
                <div class="p-2 bg-white rounded border">
                  <p><strong>Login Email:</strong> <span class="font-mono text-[#0F766E] font-bold">${formData.email}</span></p>
                  <p><strong>Initial Password:</strong> <span class="font-mono text-gray-800 font-bold">${formData.password || 'password123'}</span></p>
                </div>
                <p class="text-gray-500 text-[10px]">Auto-provisioned owner user saved in MongoDB.</p>
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'Great, Continue',
            confirmButtonColor: '#0F766E'
          });
          toast.success(`Company "${formData.name}" onboarded successfully!`);
          return;
        }
      } catch (err) {
        toast.error(err.message || 'Failed to onboard company');
      }
    }

    setIsFormModalOpen(false);
    setEditingCompany(null);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (comp) => {
    navigate(`/superadmin/companies/${comp.id || comp._id}`);
  };

  return (
    <MainLayout title="Registered Companies Master">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">All Builder & Developer Tenants</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage platform subscriptions, provision credentials, allocate quotas, and monitor telecom services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCompanies}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reload from MongoDB"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => {
                setEditingCompany(null);
                setIsFormModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4" /> Register New Company
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, owner, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <HiOutlineFilter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', 'Active', 'Deactivated', 'Expired'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
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

        {/* Companies Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Company Details</th>
                    <th className="py-3.5 px-4">Owner / Contact</th>
                    <th className="py-3.5 px-4">Plan & Billing</th>
                    <th className="py-3.5 px-4">Usage & Quotas</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedCompanies.length > 0 ? (
                    paginatedCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        
                        {/* Company Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              <HiOutlineOfficeBuilding className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-[#102A2E] block">{c.name}</span>
                              <span className="text-[11px] text-gray-400">ID: {c.id.toString().slice(-6)} • Reg: {c.joinedDate}</span>
                            </div>
                          </div>
                        </td>

                        {/* Owner / Contact */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-gray-800 block">{c.ownerName}</span>
                            <span className="text-[11px] text-[#0F766E] font-medium block">{c.email}</span>
                            <span className="text-[10px] text-gray-400 block">{c.phone}</span>
                          </div>
                        </td>

                        {/* Plan & Billing */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              (c.plan || '').includes('Enterprise')
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : (c.plan || '').includes('Standard')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {c.plan}
                            </span>
                            <span className="text-gray-500 font-bold block mt-1 text-[11px]">{c.planPrice}</span>
                          </div>
                        </td>

                        {/* Usage & Quotas */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="text-[11px] text-gray-600">
                              Users: <span className="font-bold text-gray-900">{c.usersCount ?? 0} / {c.maxUsers}</span>
                            </div>
                            <div className="text-[11px] text-gray-600">
                              Projects: <span className="font-bold text-gray-900">{c.projectsCount ?? 0} / {c.maxProjects}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'Expired'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {c.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenView(c)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                              title="View Dossier"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] transition-colors"
                              title="Edit Details"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(c.id, c.status)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                c.status === 'Active'
                                  ? 'border-gray-200 hover:bg-amber-50 text-gray-500 hover:text-amber-600'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={c.status === 'Active' ? 'Deactivate' : 'Activate'}
                            >
                              {c.status === 'Active' ? (
                                <HiOutlineBan className="w-4 h-4" />
                              ) : (
                                <HiOutlineCheck className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteCompany(c.id, c.name)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete Account"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No companies found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filtered.length > itemsPerPage && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <HiOutlineChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-[#102A2E] px-2">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <HiOutlineChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Form Modal (Create & Edit) */}
      <CompanyFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        companyData={editingCompany}
        availablePlans={plans}
      />
    </MainLayout>
  );
};
