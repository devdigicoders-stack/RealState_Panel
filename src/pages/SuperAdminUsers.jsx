import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlinePencilAlt
} from 'react-icons/hi';

export const SuperAdminUsers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Global Users Directory">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#102A2E]">Platform Users & Staff</h2>
          <p className="text-xs text-gray-500 mt-0.5">Audit and manage all users registered across all real estate companies.</p>
        </div>
        <button
          onClick={() => {
            Swal.fire({
              title: 'Create System User',
              html: `
                <div class="text-left text-xs space-y-3 p-2">
                  <label class="block font-bold">User Full Name *</label>
                  <input id="u-name" class="w-full p-2 border rounded" placeholder="e.g. Anand Mahindra" />
                  <label class="block font-bold">Email Address *</label>
                  <input id="u-email" class="w-full p-2 border rounded" placeholder="anand@company.com" />
                  <label class="block font-bold">Mobile (10 Digits) *</label>
                  <input id="u-phone" class="w-full p-2 border rounded" placeholder="+91 9876543210" />
                </div>
              `,
              confirmButtonText: 'Add User',
              confirmButtonColor: '#0F766E',
              showCancelButton: true
            }).then(r => {
              if (r.isConfirmed) toast.success('New platform user invited!');
            });
          }}
          className="px-4 py-2.5 rounded-xl bg-[#0F766E] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4 text-[#D6A84B]" /> Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6">
        <div className="relative w-full max-w-sm">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-4 py-2 text-xs border rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#102A2E] text-white uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-5">User Details</th>
                <th className="py-3 px-5">Associated Company</th>
                <th className="py-3 px-5">Role Assigned</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Last Activity</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <TableSkeleton rows={5} />
              ) : (
                filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-5">
                      <div className="font-extrabold text-[#102A2E] text-sm">{u.name}</div>
                      <div className="text-[11px] text-gray-400">{u.email} • {u.phone}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-gray-800">{u.company}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-[#102A2E]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500">{u.lastLogin}</td>
                    <td className="py-3.5 px-5 text-center">
                      <button 
                        onClick={() => toast.info(`Action triggered for ${u.name}`)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#0F766E] hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

