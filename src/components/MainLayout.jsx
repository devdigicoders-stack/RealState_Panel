import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineViewGrid,
  HiOutlineOfficeBuilding,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlinePhoneIncoming,
  HiOutlineChatAlt2,
  HiOutlineDocumentReport,
  HiOutlineSparkles,
  HiOutlineCurrencyRupee,
  HiOutlineCube,
  HiOutlineSupport,
  HiOutlineUser,
  HiOutlineKey,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineChevronDown,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlineCash,
  HiOutlineBookmark,
  HiOutlineUserGroup,
  HiOutlineMail
} from 'react-icons/hi';

export const MainLayout = ({ children, title = 'Dashboard' }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to log out of the platform?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.info('Logged out successfully');
        navigate('/login', { replace: true });
      }
    });
  };

  const handleSwitchRole = (roleKey) => {
    switchRole(roleKey);
    setRoleDropdownOpen(false);
    toast.success(`Switched to ${roleKey.replace('_', ' ').toUpperCase()}`);
    if (roleKey === 'superadmin') {
      navigate('/superadmin/dashboard');
    } else {
      navigate(`/${roleKey}/dashboard`);
    }
  };

  // SUPER ADMIN EXACT 15 SCOPED PAGES (No leads, no site visits, no customer followups!)
  const superAdminNavLinks = [
    { name: ' Dashboard', path: '/superadmin/dashboard', icon: HiOutlineViewGrid },
    { name: 'All Registered Companies', path: '/superadmin/companies', icon: HiOutlineOfficeBuilding },
    { name: 'Subscription Plans', path: '/superadmin/plans', icon: HiOutlineCreditCard },
    { name: 'Company Subscriptions', path: '/superadmin/subscriptions', icon: HiOutlineCreditCard },
    { name: 'Plan Expiry & Renewals', path: '/superadmin/renewals', icon: HiOutlineClock },
    { name: 'Company Limits (Users & Projects)', path: '/superadmin/limits', icon: HiOutlineShieldCheck },
    { name: 'Available Modules', path: '/superadmin/modules', icon: HiOutlineCube },
    { name: 'Calling Integration Providers', path: '/superadmin/calling-providers', icon: HiOutlinePhoneIncoming },
    { name: 'WhatsApp & SMS Integrations', path: '/superadmin/messaging-integrations', icon: HiOutlineChatAlt2 },
    { name: 'Website Enquiries & Leads', path: '/superadmin/enquiries', icon: HiOutlineMail },
    { name: ' Transactions', path: '/superadmin/transactions', icon: HiOutlineCurrencyRupee },
    { name: 'Support Requests', path: '/superadmin/support', icon: HiOutlineSupport },
    { name: 'Platform Reports', path: '/superadmin/reports', icon: HiOutlineDocumentReport },
    { name: 'System Settings', path: '/superadmin/settings', icon: HiOutlineCog },
    { name: 'Profile & Security', path: '/superadmin/profile', icon: HiOutlineUser },
  ];

  // Links for Other 4 Roles (Company Admin, Manager, Sales User, Agent)
  const getOtherRoleLinks = () => {
    if (user?.role === 'company_admin') {
      return [
        { name: 'Company Overview', path: '/company_admin/dashboard', icon: HiOutlineViewGrid },
       
        { name: 'Branches & Locations', path: '/company_admin/branches', icon: HiOutlineOfficeBuilding },
        { name: 'CRM & All Leads', path: '/company_admin/leads', icon: HiOutlineUsers },
        { name: 'Calling & Recordings', path: '/company_admin/calling', icon: HiOutlinePhoneIncoming },
        { name: 'Projects Master', path: '/company_admin/projects', icon: HiOutlineOfficeBuilding },
        { name: 'Interactive Plot Matrix', path: '/company_admin/plots', icon: HiOutlineLocationMarker },
        { name: 'Site Visits Dispatch', path: '/company_admin/site-visits', icon: HiOutlineCalendar },
        { name: 'Plot Bookings & Approvals', path: '/company_admin/bookings', icon: HiOutlineBookmark },
        { name: 'Customers Directory', path: '/company_admin/customers', icon: HiOutlineUserGroup },
        { name: 'Channel Partners (Brokers)', path: '/company_admin/agents', icon: HiOutlineUsers },
        { name: 'Finance & Token Receipts', path: '/company_admin/finance', icon: HiOutlineCash },
        { name: 'Team & Role Permissions', path: '/company_admin/team', icon: HiOutlineUserGroup },
        { name: 'Operational Reports', path: '/company_admin/reports', icon: HiOutlineDocumentReport },
         { name: 'Company Profile & Info', path: '/company_admin/profile', icon: HiOutlineOfficeBuilding },
      ];
    }

    if (user?.role === 'manager') {
      return [
        { name: 'Team Dashboard', path: '/manager/dashboard', icon: HiOutlineViewGrid },
        { name: 'Team Leads & Assignment', path: '/manager/leads', icon: HiOutlineUsers },
        { name: 'Calling Performance', path: '/manager/calls', icon: HiOutlinePhoneIncoming },
        { name: 'Site Visits Tracking', path: '/manager/site-visits', icon: HiOutlineCalendar },
        { name: 'Property & Plot Matrix', path: '/manager/plots', icon: HiOutlineLocationMarker },
        { name: 'Team Bookings', path: '/manager/bookings', icon: HiOutlineBookmark },
        { name: 'Customers Directory', path: '/manager/customers', icon: HiOutlineUserGroup },
        { name: 'Agent Leads & Brokers', path: '/manager/agents', icon: HiOutlineUserGroup },
        { name: 'Branch Sales Team', path: '/manager/team', icon: HiOutlineUsers },
        { name: 'Team Sales Performance', path: '/manager/performance', icon: HiOutlineDocumentReport },
        { name: 'My Profile & Security', path: '/manager/profile', icon: HiOutlineUser },
      ];
    }

    if (user?.role === 'sales_user') {
      return [
        { name: 'My Dashboard', path: '/sales_user/dashboard', icon: HiOutlineViewGrid },
        { name: 'My Assigned Leads', path: '/sales_user/leads', icon: HiOutlineUsers },
        { name: 'Calling & Dialer', path: '/sales_user/calls', icon: HiOutlinePhoneIncoming },
        { name: 'Follow-ups Reminder', path: '/sales_user/follow-ups', icon: HiOutlineCalendar },
        { name: 'Schedule Site Visit', path: '/sales_user/site-visits', icon: HiOutlineCalendar },
        { name: 'Check Plots / Hold', path: '/sales_user/plots', icon: HiOutlineLocationMarker },
        { name: 'My Bookings', path: '/sales_user/bookings', icon: HiOutlineBookmark },
        { name: 'My Customers', path: '/sales_user/customers', icon: HiOutlineUserGroup },
        { name: 'My Profile & Security', path: '/sales_user/profile', icon: HiOutlineUser },
      ];
    }

    if (user?.role === 'agent') {
      return [
        { name: 'Agent Dashboard', path: '/agent/dashboard', icon: HiOutlineViewGrid },
        { name: 'Available Projects', path: '/agent/projects', icon: HiOutlineOfficeBuilding },
        { name: 'Live Plot Map', path: '/agent/plots', icon: HiOutlineLocationMarker },
        { name: 'Register Customer', path: '/agent/leads', icon: HiOutlineUsers },
        { name: 'Site Visit Requests', path: '/agent/site-visits', icon: HiOutlineCalendar },
        { name: 'My Client Bookings', path: '/agent/bookings', icon: HiOutlineBookmark },
        { name: 'My Commissions', path: '/agent/commissions', icon: HiOutlineCash },
        { name: 'My Profile & Security', path: '/agent/profile', icon: HiOutlineUser },
      ];
    }

    return [];
  };

  const navLinks = user?.role === 'superadmin' ? superAdminNavLinks : getOtherRoleLinks();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex font-sans">

      {/* 1. FIXED SIDEBAR - Strictly dedicated to platform  control */}
      <aside className="w-64 h-screen bg-[#102A2E] text-white flex flex-col justify-between border-r border-[#102A2E]/50 shrink-0 select-none z-30 fixed top-0 left-0">

        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D6A84B] to-[#B58B35] flex items-center justify-center text-[#102A2E] font-black shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center leading-none">
                <span className="text-base font-black tracking-tight text-white">RealEstate</span>
                <span className="text-base font-black text-[#D6A84B]">Pro</span>
              </div>
              <div className="text-[9px] font-semibold text-emerald-300 uppercase tracking-widest mt-1 truncate max-w-[130px]">
                {user?.role === 'superadmin' ? 'Platform Super Admin' : (user?.companyName || user?.company?.name || 'CRM Suite')}
              </div>
            </div>
          </div>
        </div>

        {/* User Role & Assigned Branch / Tenant Badge */}
        <div className="px-3 pt-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#0F766E]/40 to-[#0F766E]/10 border border-[#0F766E]/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">
                {user?.role === 'superadmin' ? 'Platform HQ Control' : 'Assigned Workplace'}
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs font-black text-white truncate">
              {user?.role === 'superadmin' 
                ? 'Super Administrator'
                : (user?.companyName || user?.company?.name || 'Real Estate Company')}
            </p>
            {user?.role !== 'superadmin' && (
              <div className="pt-1 border-t border-emerald-500/20 flex items-center justify-between text-[10px]">
                <span className="text-emerald-300 font-medium">Branch:</span>
                <span className="font-bold text-white bg-[#0E2428] px-1.5 py-0.5 rounded border border-emerald-500/30 truncate max-w-[130px]">
                  {user?.branchName || 'Head Office / HQ'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <nav className="space-y-0.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                      ? 'bg-[#0F766E] text-white shadow-md font-bold border-l-4 border-[#D6A84B]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#D6A84B]" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Quick Role Switcher */}
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-[#0E2428]">
          <div className="relative">
           

            {roleDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-[#0E2327] border border-white/15 rounded-xl shadow-2xl p-1 space-y-0.5 z-50">
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
                  Test Any Role:
                </div>
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.role}
                    onClick={() => handleSwitchRole(c.role)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors ${user?.role === c.role
                        ? 'bg-[#0F766E] text-white font-bold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="truncate">{c.badge.split('/')[0]}</span>
                    {user?.role === c.role && <HiOutlineShieldCheck className="w-3.5 h-3.5 text-[#D6A84B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <HiOutlineLogout className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 ml-64 h-screen flex flex-col min-w-0 overflow-y-auto">

        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-[#102A2E] tracking-tight">{title}</h1>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#0F766E] border border-emerald-200 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse"></span>
              {user?.badge || (user?.role ? user.role.toUpperCase() : 'Authenticated User')}
            </div>

            {/* Display Assigned Company & Branch on Top Navbar for Sales, Agents & Managers */}
            {user?.role !== 'superadmin' && (user?.companyName || user?.branchName) && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <span className="font-extrabold text-[#102A2E] flex items-center gap-1">
                  🏢 {user?.companyName || user?.company?.name || 'Company'}
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-bold text-[#0F766E] flex items-center gap-1">
                  📍 {user?.branchName || 'Head Office / HQ'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
       

          

            {/* Profile Identity Widget in Header (Photo, Name, Role Badge) for ALL Roles */}
            <NavLink 
              to={user?.role === 'superadmin' ? '/superadmin/profile' : `/${user?.role}/profile`} 
              className="flex items-center gap-2.5 pl-3 border-l border-gray-200 hover:opacity-90 group transition-all"
              title="View & Edit Profile"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name}
                    className="w-9 h-9 rounded-2xl object-cover border-2 border-[#D6A84B] shadow-xs group-hover:ring-2 group-hover:ring-[#0F766E]/40 transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#102A2E] text-white flex items-center justify-center font-black text-sm border-2 border-[#D6A84B] shadow-xs group-hover:ring-2 group-hover:ring-[#0F766E]/40 transition-all">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-black text-[#102A2E] leading-tight truncate max-w-[150px] group-hover:text-[#0F766E] transition-colors">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-[#0F766E] font-bold leading-tight truncate max-w-[150px] capitalize">
                  {user?.role === 'superadmin' 
                    ? 'Super Administrator'
                    : (user?.role === 'company_admin'
                        ? 'Company Admin / Owner'
                        : (user?.designation || user?.badge || user?.role?.replace('_', ' ')))}
                </div>
              </div>
            </NavLink>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="p-5 md:p-6 flex-1 bg-[#F8FAFC]">
          {children}
        </main>

      </div>

    </div>
  );
};
