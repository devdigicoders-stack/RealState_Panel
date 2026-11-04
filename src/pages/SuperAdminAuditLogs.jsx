import React, { useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { HiOutlineShieldCheck, HiOutlineSearch } from 'react-icons/hi';

export const SuperAdminAuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const logs = [
    { id: 'LOG-8801', actor: 'Super Administrator', action: 'Company Status Toggle', target: 'Royal Heritage Builders -> Expired', ip: '103.21.124.9', time: '10 Mins ago' },
    { id: 'LOG-8802', actor: 'Super Administrator', action: 'Plan Quota Edit', target: 'Enterprise Pro (Max Users 50 -> 60)', ip: '103.21.124.9', time: '1 Hour ago' },
    { id: 'LOG-8803', actor: 'System Worker', action: 'Daily Telephony Sync', target: 'Exotel Gateway Health Check OK', ip: '127.0.0.1 (Cron)', time: '4 Hours ago' },
    { id: 'LOG-8804', actor: 'Super Administrator', action: 'Tenant Provisioning', target: 'Green City Infra Created', ip: '103.21.124.9', time: 'Yesterday' },
    { id: 'LOG-8805', actor: 'Super Administrator', action: 'Support Ticket Closed', target: 'Ticket #TKT-104 (Billing Discrepancy)', ip: '103.21.124.9', time: '2 Days ago' },
  ];

  const filtered = logs.filter(l => 
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Security & Audit Logs">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Audit Records</span>
          <div className="text-2xl font-black text-[#102A2E] mt-1">{logs.length} Events</div>
          <p className="text-[10px] text-gray-500 mt-1">Immutable SHA-256 Ledger</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#0F766E] uppercase">Security Level</span>
          <div className="text-2xl font-black text-[#0F766E] mt-1">Enterprise Grade</div>
          <p className="text-[10px] text-emerald-500 mt-1">IP Tracking & MFA Verified</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Admin Sessions</span>
          <div className="text-2xl font-black text-[#D6A84B] mt-1">Active (103.21.124.9)</div>
          <p className="text-[10px] text-gray-500 mt-1">Session timeout 60 mins</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#102A2E]">Platform Security Audit Trail</h2>
          <p className="text-xs text-gray-500 mt-0.5">Immutable activity logs of all administrative actions, quota adjustments, and tenant status changes.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-[#102A2E] text-white uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-5">Event ID</th>
              <th className="py-3 px-5">Actor / Admin</th>
              <th className="py-3 px-5">Action Performed</th>
              <th className="py-3 px-5">Entity / Target</th>
              <th className="py-3 px-5">IP Address</th>
              <th className="py-3 px-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((l) => (
              <tr key={l.id} className="hover:bg-gray-50/80">
                <td className="py-3 px-5 font-mono font-bold text-[#102A2E]">{l.id}</td>
                <td className="py-3 px-5 font-semibold text-gray-800">{l.actor}</td>
                <td className="py-3 px-5 font-bold text-[#0F766E]">{l.action}</td>
                <td className="py-3 px-5">{l.target}</td>
                <td className="py-3 px-5 font-mono text-gray-400">{l.ip}</td>
                <td className="py-3 px-5 text-gray-500">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </MainLayout>
  );
};

