import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCheck,
  HiOutlineUser,
  HiOutlineGlobeAlt,
  HiOutlineCloudUpload,
  HiOutlineIdentification
} from 'react-icons/hi';
import { companyAdminService } from '../../services/companyAdminService';
import { FilePicker } from '../../components/common/FilePicker';

export const CompanyAdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    companyName: '',
    ownerName: '',
    email: '',
    companyPhone: '',
    gstin: '',
    pan: '',
    reraRegistration: '',
    address: '',
    website: '',
    logo: '',
    leadRoutingMode: 'Round-Robin Auto Assignment',
    callingCallerId: ''
  });

  const [companyMeta, setCompanyMeta] = useState({
    plan: '',
    status: '',
    expiryDate: '',
    usersLimit: 0,
    projectsLimit: 0,
    renewalCount: 0
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getProfile();
      if (res.success && res.data) {
        const u = res.data.user || {};
        const c = res.data.company || {};
        
        setFormData({
          name: u.name || '',
          phone: u.phone || '',
          avatar: u.avatar || '',
          companyName: c.name || u.companyName || '',
          ownerName: c.ownerName || u.name || '',
          email: u.email || c.email || '',
          companyPhone: c.phone || u.phone || '',
          gstin: c.gstin || '',
          pan: c.pan || '',
          reraRegistration: c.reraRegistration || '',
          address: c.address || '',
          website: c.website || '',
          logo: c.logo || '',
          leadRoutingMode: c.leadRoutingMode || 'Round-Robin Auto Assignment',
          callingCallerId: c.callingCallerId || ''
        });

        setCompanyMeta({
          plan: c.plan || 'Standard Growth',
          status: c.status || 'Active',
          expiryDate: c.expiryDate || '',
          usersLimit: c.usersLimit || 15,
          projectsLimit: c.projectsLimit || 5,
          renewalCount: c.renewalCount || 0
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch company profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await companyAdminService.updateProfile(formData);
      if (res.success) {
        toast.success(res.message || 'Profile & Company details updated successfully!');
        // Update user state in AuthContext & localStorage so Header immediately reflects the new profile picture & name
        if (res.data?.user) {
          updateUser(res.data.user);
        }
        await fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Company Profile & Tenant Settings">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading tenant profile & credentials...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Company Profile & Tenant Settings">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Company Profile & Tenant Configuration</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner manages registered company credentials, GSTIN, RERA registration, brand logo, and calling caller IDs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            companyMeta.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            ● {companyMeta.status} License
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#102A2E]/5 text-[#102A2E] border border-gray-200">
            {companyMeta.plan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Brand Identity & Tenant Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col items-center text-center">
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Company Logo"
                className="w-24 h-24 rounded-3xl object-contain border border-gray-200 p-1 shadow-md mb-4 bg-white"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#102A2E] to-[#0F766E] text-[#D6A84B] font-black text-3xl flex items-center justify-center shadow-lg mb-4">
                {(formData.companyName || 'CO').substring(0, 2).toUpperCase()}
              </div>
            )}
            
            <h3 className="font-extrabold text-base text-[#102A2E]">{formData.companyName || 'Registered Tenant'}</h3>
            <p className="text-xs text-emerald-700 font-bold mt-0.5">{companyMeta.plan} • Validated Account</p>
            
            <div className="w-full mt-4 pt-4 border-t border-gray-100 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">RERA License:</span>
                <span className="font-mono font-bold text-gray-700">{formData.reraRegistration || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">GSTIN:</span>
                <span className="font-mono font-bold text-gray-700">{formData.gstin || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Director / Owner:</span>
                <span className="font-bold text-gray-800">{formData.ownerName || formData.name || 'Owner'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Quota Limits:</span>
                <span className="font-bold text-[#0F766E]">{companyMeta.usersLimit} Staff • {companyMeta.projectsLimit} Projects</span>
              </div>
              {companyMeta.expiryDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">License Expiry:</span>
                  <span className="font-bold text-amber-700">
                    {new Date(companyMeta.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Account Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col items-center">
            <h4 className="font-extrabold text-sm text-[#102A2E] mb-3 flex items-center gap-2 self-start">
              <HiOutlineUser className="w-4 h-4 text-[#0F766E]" />
              <span>Admin Profile Picture</span>
            </h4>
            <div className="relative mb-4">
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Admin Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#D6A84B] shadow-md"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <div className="w-full">
              <FilePicker
                label="Admin Avatar (Upload or Web URL)"
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                category="images"
                accept="image/*"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Company Edit Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <h3 className="font-extrabold text-sm text-[#102A2E] mb-4 flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-4 h-4 text-[#0F766E]" />
            <span>Company Legal Identity & Contact Details</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company Registered Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Owner / Director Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Contact Email *</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full p-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl outline-none cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Managed by Platform Super Admin</span>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary Official Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">RERA Registration No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPRERAAGT19882"
                  value={formData.reraRegistration}
                  onChange={(e) => setFormData({ ...formData, reraRegistration: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl uppercase font-mono outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 09AAACA1122D1Z9"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono uppercase outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company PAN Card</label>
                <input
                  type="text"
                  placeholder="e.g. AAACA1122D"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono uppercase outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company Website URL</label>
                <input
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Calling Caller ID / Pilot Number</label>
                <input
                  type="text"
                  placeholder="+91 80471 99000 (Exotel Pilot Number)"
                  value={formData.callingCallerId}
                  onChange={(e) => setFormData({ ...formData, callingCallerId: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            {/* Company Logo Picker */}
            <div className="pt-2">
              <FilePicker
                label="Company Brand Logo (Upload File or Direct URL)"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                category="images"
                accept="image/*"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Headquarters Physical Address</label>
              <textarea
                rows="2"
                placeholder="Complete postal address with pin code..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <HiOutlineCheck className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Company Profile'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </MainLayout>
  );
};
export default CompanyAdminProfile;
