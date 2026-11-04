import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { superAdminService } from '../services/superAdminService';
import { toast } from 'react-toastify';
import { 
  HiOutlineCog, 
  HiOutlineShieldCheck, 
  HiOutlineKey, 
  HiOutlineGlobeAlt, 
  HiOutlineMail, 
  HiOutlineBell,
  HiOutlineSparkles,
  HiOutlineLockClosed,
  HiOutlineDatabase,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  const [general, setGeneral] = useState({
    platformName: 'RealEstatePro SaaS Cloud ERP',
    tagline: 'Multi-Tenant Real Estate & Property CRM System',
    supportEmail: 'admin@realestatepro.in',
    salesHelpline: '+91 80000 11223',
    trialDays: 14,
    defaultCurrency: 'INR (₹)',
    enforce2FA: true,
    maintenanceMode: false
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getPlatformSettings();
      if (res && res.success && res.data) {
        setGeneral(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load settings from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    try {
      await superAdminService.updatePlatformSettings(general);
      toast.success('Platform global settings saved in MongoDB!');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error('All password fields are required');
      return;
    }
    if (passwords.next.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      await superAdminService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      toast.success('Super Admin password successfully updated in MongoDB!');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <MainLayout title="Platform Global System Settings">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Platform Configuration & Security</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live platform branding, support emails, 2FA policies, and database connection settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['general', 'security', 'database'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#102A2E] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab} Settings
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-[#102A2E]">Global Platform Identity</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Platform ERP Name</label>
                <input
                  type="text"
                  value={general.platformName || ''}
                  onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Platform Tagline</label>
                <input
                  type="text"
                  value={general.tagline || ''}
                  onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Global Support Email</label>
                <input
                  type="email"
                  value={general.supportEmail || ''}
                  onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sales Helpline</label>
                <input
                  type="text"
                  value={general.salesHelpline || ''}
                  onChange={(e) => setGeneral({ ...general, salesHelpline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Default Trial Days</label>
                <input
                  type="number"
                  value={general.trialDays || 14}
                  onChange={(e) => setGeneral({ ...general, trialDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Default Platform Currency</label>
                <input
                  type="text"
                  value={general.defaultCurrency || 'INR (₹)'}
                  onChange={(e) => setGeneral({ ...general, defaultCurrency: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={general.maintenanceMode || false}
                  onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F766E]"
                />
                <span>Platform Maintenance Mode (Block Tenant Access)</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0c5e58] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Global Settings
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-[#102A2E]">Change Platform Super Admin Password</h3>
            <p className="text-xs text-gray-500">Requires your current password to hash and store a new bcrypt secret in MongoDB.</p>

            <div className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">New Password (Min 6 Characters)</label>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0c5e58] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Update Super Admin Password
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Database & Telemetry */}
        {activeTab === 'database' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-[#102A2E]">MongoDB Enterprise Cluster Info</h3>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 font-mono text-[11px]">
              <div><strong>Status:</strong> <span className="text-emerald-600 font-bold">● Connected & Synchronized</span></div>
              <div><strong>Host:</strong> 127.0.0.1:27017</div>
              <div><strong>Database:</strong> realestate_crm</div>
              <div><strong>Collections:</strong> users, companies, plans, modules, callingproviders, messaginggateways, transactions, supporttickets, platformsettings</div>
              <div><strong>Indexing:</strong> Full Compound Indices Active on email, status, and createdAt</div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};
