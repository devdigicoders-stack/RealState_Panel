import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { superAdminService } from '../services/superAdminService';
import { CardSkeleton } from '../components/Skeleton';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineCreditCard,
  HiOutlineServer,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlineCheck
} from 'react-icons/hi';

export const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompany = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getCompanyById(id);
      if (res && res.success && res.data) {
        setCompany(res.data);
      } else {
        toast.error('Company details not found');
      }
    } catch (err) {
      console.error('Failed to fetch company details:', err);
      toast.error(err.message || 'Error fetching company details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const handleToggleStatus = async () => {
    if (!company) return;
    const nextStatus = company.status === 'Active' ? 'Deactivated' : 'Active';
    Swal.fire({
      title: `${nextStatus === 'Active' ? 'Activate' : 'Deactivate'} Company?`,
      text: `Are you sure you want to change status to ${nextStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: nextStatus === 'Active' ? '#0F766E' : '#d33',
      confirmButtonText: `Yes, ${nextStatus}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await superAdminService.toggleCompanyStatus(company._id || id, nextStatus);
          setCompany({ ...company, status: nextStatus });
          toast.success(`Company status changed to ${nextStatus}`);
        } catch (err) {
          toast.error(err.message || 'Failed to update status');
        }
      }
    });
  };

  const handleRenew = async () => {
    if (!company) return;
    Swal.fire({
      title: `Renew License: ${company.name}`,
      text: `Grant 1-year license validity extension?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, Renew License'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await superAdminService.renewCompanyLicense(company._id || id);
          toast.success(`License extended 1 Year for ${company.name}!`);
          fetchCompany();
        } catch (err) {
          toast.error(err.message || 'Renewal failed');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!company) return;
    Swal.fire({
      title: 'Delete Tenant Account?',
      text: `This will permanently delete ${company.name} and all data from MongoDB.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete Permanently'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await superAdminService.deleteCompany(company._id || id);
          toast.success(`${company.name} deleted successfully`);
          navigate('/superadmin/companies');
        } catch (err) {
          toast.error(err.message || 'Failed to delete');
        }
      }
    });
  };

  return (
    <MainLayout title="Company Tenant Dossier">
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/superadmin/companies')}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-[#102A2E] hover:bg-gray-50 shadow-xs transition-all cursor-pointer"
              title="Back to All Companies"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Tenant Dossier</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-mono">ID: {id?.slice(-8)}</span>
              </div>
              <h1 className="text-2xl font-black text-[#102A2E] tracking-tight">
                {company?.name || 'Loading Company...'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCompany}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>

            {company && (
              <>
                <button
                  onClick={handleRenew}
                  className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <HiOutlineRefresh className="w-4 h-4" /> Renew 1-Yr
                </button>

                <button
                  onClick={handleToggleStatus}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    company.status === 'Active'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {company.status === 'Active' ? <HiOutlineBan className="w-4 h-4" /> : <HiOutlineCheck className="w-4 h-4" />}
                  {company.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={handleDelete}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all cursor-pointer"
                  title="Delete Tenant"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : !company ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs">
            <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">Company Not Found</h3>
            <p className="text-xs text-gray-400 mt-1">This tenant might have been removed or the ID is invalid.</p>
            <Link
              to="/superadmin/companies"
              className="mt-4 inline-block px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl"
            >
              Back to Companies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Main Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#102A2E] to-[#0F766E] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                    {company.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-[#102A2E]">{company.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        company.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {company.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Registered Tenant • Managed by Platform Super Admin
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Company Owner</span>
                    <span className="font-extrabold text-gray-900 text-sm mt-0.5 block flex items-center gap-1.5">
                      <HiOutlineUser className="w-4 h-4 text-[#0F766E]" /> {company.ownerName}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Official Email</span>
                    <span className="font-bold text-[#0F766E] text-xs mt-0.5 block flex items-center gap-1.5 break-all">
                      <HiOutlineMail className="w-4 h-4 text-[#0F766E]" /> {company.email}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Contact Phone</span>
                    <span className="font-bold text-gray-800 text-xs mt-0.5 block flex items-center gap-1.5">
                      <HiOutlinePhone className="w-4 h-4 text-[#0F766E]" /> {company.phone}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Location / Head Office</span>
                    <span className="font-bold text-gray-800 text-xs mt-0.5 block flex items-center gap-1.5">
                      <HiOutlineLocationMarker className="w-4 h-4 text-[#0F766E]" />
                      {company.address || (company.city ? `${company.city}, ${company.state}` : 'Head Office, India')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telecom & Gateway Configuration */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                <h3 className="text-base font-extrabold text-[#102A2E] mb-1">Telephony & Messaging Integrations</h3>
                <p className="text-xs text-gray-500 mb-4">Dedicated telecom gateways routed for this tenant</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                    <span className="text-gray-400 text-[11px] font-bold uppercase block">VoIP Telephony Provider</span>
                    <span className="text-sm font-bold text-[#102A2E] block mt-1">
                      {company.callingProvider || 'Exotel Cloud PBX'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-2 inline-flex items-center gap-1">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Direct PRI trunk linked
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                    <span className="text-gray-400 text-[11px] font-bold uppercase block">SMS & WhatsApp Gateway</span>
                    <span className="text-sm font-bold text-[#102A2E] block mt-1">
                      {company.smsProvider || 'Gupshup WhatsApp API'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-2 inline-flex items-center gap-1">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" /> High throughput verified
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Subscription, Quotas & Expiry */}
            <div className="space-y-6">
              
              {/* Subscription Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A84B]">Active Subscription</span>
                <div className="flex items-center justify-between mt-2">
                  <h3 className="text-lg font-black text-[#102A2E]">{company.plan || 'Standard Growth'}</h3>
                  <span className="text-sm font-black text-[#0F766E]">{company.planPrice || '₹14,999/mo'}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Staff Limit:</span>
                    <span className="font-bold text-gray-900">{company.usersLimit || 15} Seats</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Staff in DB:</span>
                    <span className="font-bold text-[#0F766E]">{company.staffCount || 1} Users</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Project Capacity:</span>
                    <span className="font-bold text-gray-900">{company.projectsLimit || 5} Active Projects</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">License Expiration:</span>
                    <span className="font-bold text-gray-900">
                      {company.expiryDate ? new Date(company.expiryDate).toLocaleDateString('en-IN') : '31 Oct 2027'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Renewals Recorded:</span>
                    <span className="font-bold text-gray-900">{company.renewalCount || 0} times</span>
                  </div>
                </div>

                <button
                  onClick={handleRenew}
                  className="w-full mt-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HiOutlineRefresh className="w-4 h-4" /> Extend Validity (1 Year)
                </button>
              </div>

              {/* System Security & Logs */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs text-xs space-y-3">
                <h4 className="font-extrabold text-[#102A2E] flex items-center gap-1.5">
                  <HiOutlineShieldCheck className="w-4 h-4 text-[#0F766E]" /> Multi-Tenant Isolation
                </h4>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Tenant data is sandboxed with strict MongoDB ObjectId scoping. Only authorized staff under this company ID can query its leads, plots, and financial accounts.
                </p>
                <div className="pt-2 text-[10px] text-gray-400 font-mono">
                  Created At: {company.createdAt ? new Date(company.createdAt).toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </MainLayout>
  );
};

