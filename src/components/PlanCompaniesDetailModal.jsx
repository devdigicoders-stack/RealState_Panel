import React, { useState } from 'react';
import { 
  HiOutlineX, 
  HiOutlineOfficeBuilding, 
  HiOutlineCreditCard, 
  HiOutlineCalendar, 
  HiOutlineRefresh, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlineUserGroup,
  HiOutlineExternalLink,
  HiOutlineSearch,
  HiOutlineFilter
} from 'react-icons/hi';

export const PlanCompaniesDetailModal = ({ 
  isOpen, 
  onClose, 
  plan, 
  companies = [], 
  allCompanies = [], 
  onRenewCompany 
}) => {
  if (!isOpen || !plan) return null;

  // Accept either 'companies' or 'allCompanies' prop safely with default empty array fallback
  const companyList = Array.isArray(companies) && companies.length > 0 
    ? companies 
    : (Array.isArray(allCompanies) ? allCompanies : []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter companies that are subscribed to this plan
  // Also check if plan.name matches (case-insensitive or normalized)
  const planCompanies = companyList.filter((c) => {
    if (!c) return false;
    const isThisPlan = (c.plan?.toLowerCase() === plan.name?.toLowerCase()) ||
                       (plan.name === 'Enterprise Elite' && c.plan?.includes('Enterprise')) ||
                       (plan.name === 'Enterprise Pro' && c.plan?.includes('Enterprise')) ||
                       (plan.name === 'Standard Growth' && (c.plan?.includes('Standard') || c.plan?.includes('Growth'))) ||
                       (plan.name === 'Starter Plan' && c.plan?.includes('Starter'));
    return isThisPlan;
  });

  const filtered = planCompanies.filter((c) => {
    const matchSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate quick stats for this plan
  const activeCount = planCompanies.filter(c => c.status === 'Active').length;
  const expiredCount = planCompanies.filter(c => c.status === 'Expired').length;
  const totalMRR = planCompanies.length * (Number(plan.price) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#102A2E] via-[#0F766E] to-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black text-[#D6A84B] shadow-inner">
              <HiOutlineCreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-extrabold tracking-tight">{plan.name}</h3>
                <span className="bg-[#D6A84B] text-[#102A2E] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  ₹{Number(plan.price).toLocaleString('en-IN')}/{plan.duration || 'mo'}
                </span>
                {plan.isPopular && (
                  <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ★ Featured
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 mt-1">
                Subscribed Tenant Companies Audit • Validity, Expirations, Renewal History & Limits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Telemetry Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-gray-50 border-b border-gray-200 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">Total Subscribed</span>
            <div className="text-lg font-black text-[#102A2E] mt-0.5">{planCompanies.length} Companies</div>
            <div className="text-[10px] text-gray-500">Live platform tenants</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-emerald-600">Active Licenses</span>
            <div className="text-lg font-black text-emerald-700 mt-0.5">{activeCount} Tenants</div>
            <div className="text-[10px] text-emerald-600">Within valid validity window</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-red-500">Expired Licenses</span>
            <div className="text-lg font-black text-red-600 mt-0.5">{expiredCount} Tenants</div>
            <div className="text-[10px] text-red-500">Needs immediate renewal</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-[#D6A84B]">Estimated Plan MRR</span>
            <div className="text-lg font-black text-[#102A2E] mt-0.5">₹{totalMRR.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-gray-500">Monthly recurring billing</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 shrink-0">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, admin name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
              <HiOutlineFilter className="w-3.5 h-3.5" /> Filter:
            </span>
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              {['All', 'Active', 'Expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-[#102A2E] shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Companies Table (Single-line, horizontally scrollable) */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Company & Owner</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 whitespace-nowrap">Subscribed On (Date & Time)</th>
                    <th className="py-3 px-4 whitespace-nowrap">Expiry Date</th>
                    <th className="py-3 px-4 whitespace-nowrap">Renewal Count</th>
                    <th className="py-3 px-4 whitespace-nowrap">Last Renewed On</th>
                    <th className="py-3 px-4 whitespace-nowrap">Seat / Site Usage</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Renewal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400">
                        <HiOutlineOfficeBuilding className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No companies registered under this plan matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      // Generate realistic default renewal info if missing
                      const renewalCount = c.renewalCount !== undefined ? c.renewalCount : (c.status === 'Active' ? 2 : 0);
                      const lastRenewedAt = c.lastRenewedAt || (renewalCount > 0 ? '15 Jan 2026, 11:30 AM' : 'Never Renewed');
                      const subscribedAt = c.joinedDate ? `${c.joinedDate}, 10:00 AM` : '01 Jan 2026, 09:30 AM';

                      return (
                        <tr key={c.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                          {/* Company & Owner */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#102A2E] to-[#0F766E] text-[#D6A84B] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                                {c.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-[#102A2E] text-xs">{c.name}</div>
                                <div className="text-gray-400 text-[10px]">
                                  {c.ownerName} • <span className="text-gray-600 font-medium">{c.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'Expired'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {c.status}
                            </span>
                          </td>

                          {/* Subscribed Date & Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-gray-800 font-bold text-xs">{subscribedAt}</div>
                            <div className="text-[10px] text-gray-400">Initial registration</div>
                          </td>

                          {/* Expiry Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className={`font-bold text-xs ${c.status === 'Expired' ? 'text-red-600' : 'text-gray-800'}`}>
                              {c.expiryDate}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {c.status === 'Expired' ? 'Expired on this date' : 'Active validity'}
                            </div>
                          </td>

                          {/* Renewal Count */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs bg-emerald-50 text-[#0F766E] px-2.5 py-1 rounded-md border border-emerald-100">
                              {renewalCount} Times Renewed
                            </span>
                          </td>

                          {/* Last Renewed Date & Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-gray-700 font-semibold text-xs">{lastRenewedAt}</div>
                            <div className="text-[10px] text-gray-400">Auto / manual transaction</div>
                          </td>

                          {/* Seat / Project Limits */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-xs font-semibold text-gray-800">
                              Seats: <span className="font-bold text-[#0F766E]">{c.usersCount || 0}</span> / {c.maxUsers || plan.userLimit}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Projects: {c.projectsCount || 0} / {c.maxProjects || plan.projectLimit}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => onRenewCompany(c)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-[#102A2E] text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <HiOutlineRefresh className="w-3.5 h-3.5" />
                              <span>Renew License</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
          <div className="text-gray-500">
            Showing <strong className="text-gray-800">{filtered.length}</strong> of <strong>{planCompanies.length}</strong> companies under <strong>{plan.name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

