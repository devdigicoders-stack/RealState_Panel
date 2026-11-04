import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { FilePicker } from '../components/common/FilePicker';
import { toast } from 'react-toastify';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineShieldCheck, 
  HiOutlineKey,
  HiOutlineCheckCircle,
  HiOutlineOfficeBuilding,
  HiOutlineLockClosed
} from 'react-icons/hi';

export const UniversalUserProfile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    role: user?.role || '',
    badge: user?.badge || '',
    branchName: user?.branchName || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role || '',
        badge: user.badge || '',
        branchName: user.branchName || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
        branchName: profile.branchName
      });
      if (res.success && res.user) {
        toast.success(res.message || 'Profile updated successfully!');
        // Update auth state in localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = { ...parsed, ...res.user };
          localStorage.setItem('user', JSON.stringify(updated));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      setPwLoading(true);
      const res = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (res.success) {
        toast.success(res.message || 'Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'superadmin': return 'Platform Super Administrator';
      case 'company_admin': return 'Company Owner / Administrator';
      case 'manager': return 'Branch / Sales Manager';
      case 'sales_user': return 'Sales Executive / Employee';
      case 'agent': return 'Channel Partner / Broker';
      default: return 'User';
    }
  };

  return (
    <MainLayout title="User Profile & Security Settings">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Card Banner */}
        <div className="bg-gradient-to-r from-[#102A2E] to-[#0F766E] rounded-3xl p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                {getRoleDisplayName(user?.role)}
              </span>
              <h1 className="text-2xl font-black">{profile.name || 'User'}</h1>
              <p className="text-xs text-white/80 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>{profile.email}</span>
                <span>•</span>
                <span>{profile.phone || '+91 98765 00000'}</span>
                {profile.branchName && (
                  <>
                    <span>•</span>
                    <span>Branch: {profile.branchName}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Form 1: Edit Profile Details */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <HiOutlineUser className="w-5 h-5 text-[#0F766E]" />
              <h2 className="text-sm font-black text-[#102A2E]">Personal Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="10-digit phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Profile Photo</label>
                <FilePicker
                  value={profile.avatar}
                  onChange={(url) => setProfile({ ...profile, avatar: url })}
                  label="Upload Profile Photo"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <HiOutlineKey className="w-5 h-5 text-[#0F766E]" />
              <h2 className="text-sm font-black text-[#102A2E]">Change Account Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <HiOutlineLockClosed className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  After changing password, use your new credentials for all subsequent logins.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2.5 bg-[#102A2E] hover:bg-[#0F766E] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <HiOutlineKey className="w-4 h-4" />
                  <span>{pwLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

