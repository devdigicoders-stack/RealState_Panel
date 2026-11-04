import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { superAdminService } from '../services/superAdminService';
import { FilePicker } from '../components/common/FilePicker';
import { toast } from 'react-toastify';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineShieldCheck, 
  HiOutlineKey,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SuperAdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Super Administrator',
    email: user?.email || 'superadmin@crm.com',
    phone: user?.phone || '+91 99999 88888',
    badge: user?.badge || 'Platform Super Admin',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    designation: 'Platform Super Administrator & Architect',
    timezone: 'Asia/Kolkata (IST +5:30)',
    department: 'Platform Governance & Infrastructure',
    twoFactorEnabled: true
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getProfile();
      if (res && res.success && res.data) {
        setProfile(prev => ({
          ...prev,
          name: res.data.name || prev.name,
          email: res.data.email || prev.email,
          phone: res.data.phone || prev.phone,
          avatar: res.data.avatar || prev.avatar,
          badge: res.data.badge || prev.badge
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await superAdminService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar
      });
      if (res && res.success) {
        setIsEditing(false);
        toast.success('Super Admin profile updated in MongoDB!');
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <MainLayout title="Super Admin Profile & Security">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Identity Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-3xl object-cover border-4 border-[#D6A84B] shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs" title="Super Admin Verified">
              ✓
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-[#102A2E]">{profile.name}</h2>
                <p className="text-xs text-[#0F766E] font-bold mt-0.5">{profile.badge}</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isEditing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-[#0F766E] hover:bg-[#0c5e58] text-white shadow-xs'
                }`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Highest administrative authority with full control across all tenants, pricing plans, telecom gateways, and system infrastructure.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <HiOutlineMail className="w-4 h-4 text-[#0F766E]" /> {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlinePhone className="w-4 h-4 text-[#0F766E]" /> {profile.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600" /> Full System Access
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit / View Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
          <h3 className="font-extrabold text-base text-[#102A2E] mb-1">Administrative Credentials & Info</h3>
          <p className="text-xs text-gray-500 mb-6">Persistent Super Admin identity saved in MongoDB</p>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="sm:col-span-2">
                {isEditing ? (
                  <FilePicker
                    label="Super Admin Profile Picture (Upload File or Enter Image Link)"
                    value={profile.avatar}
                    onChange={(url) => setProfile({ ...profile, avatar: url })}
                    role="superadmin"
                    category="images"
                    placeholder="https://... or choose photo"
                    helperText="Uploads automatically to backend/uploads/superadmin/images/ or link from web"
                  />
                ) : (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      disabled
                      value={profile.avatar}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0c5e58] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </MainLayout>
  );
};
