import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import { superAdminService } from '../services/superAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  HiOutlineShieldCheck, 
  HiOutlineOfficeBuilding, 
  HiOutlinePencilAlt, 
  HiOutlineUserGroup, 
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineRefresh
} from 'react-icons/hi';

export const SuperAdminLimits = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const fetchLimits = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getCompanyLimits();
      if (res && res.success && Array.isArray(res.data)) {
        setCompanies(res.data.map(c => ({
          ...c,
          id: c._id || c.id,
          maxUsers: c.usersLimit || 15,
          maxProjects: c.projectsLimit || 5
        })));
      }
    } catch (err) {
      console.error('Failed to load limits:', err);
      toast.error('Failed to fetch company limits from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const handleEditLimits = (company) => {
    Swal.fire({
      title: `Configure Limits: ${company.name}`,
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <div>
            <label class="block font-bold mb-1">Company User Limits (Staff Seats):</label>
            <input id="swal-user-limit" type="number" class="w-full p-2 border rounded font-bold" value="${company.maxUsers}" />
            <p class="text-[10px] text-gray-500 mt-0.5">Managers, Telecallers & Site Executives</p>
          </div>
          <div>
            <label class="block font-bold mb-1">Company Project Limits (Townships / Sites):</label>
            <input id="swal-proj-limit" type="number" class="w-full p-2 border rounded font-bold" value="${company.maxProjects}" />
            <p class="text-[10px] text-gray-500 mt-0.5">Active real estate projects/layouts</p>
          </div>
        </div>
      `,
      confirmButtonText: 'Update Company Limits',
      confirmButtonColor: '#0F766E',
      showCancelButton: true,
      preConfirm: () => {
        const u = document.getElementById('swal-user-limit').value;
        const p = document.getElementById('swal-proj-limit').value;
        if (!u || !p || Number(u) < 1 || Number(p) < 1) {
          Swal.showValidationMessage('Limits must be at least 1');
        }
        return { maxUsers: parseInt(u), maxProjects: parseInt(p) };
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          await superAdminService.adjustLimits(company.id || company._id, res.value);
          toast.success(`Quotas updated in MongoDB for ${company.name}!`);
          fetchLimits();
        } catch (err) {
          toast.error(err.message || 'Failed to update limits');
        }
      }
    });
  };

  const filtered = companies.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.plan || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsersAllocated = companies.reduce((acc, c) => acc + (c.maxUsers || 0), 0);
  const totalProjectsAllocated = companies.reduce((acc, c) => acc + (c.maxProjects || 0), 0);

  return (
    <MainLayout title="Company Limits & Quotas">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Tenant Seat & Project Quotas</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live server allocation for active staff users and project townships across all companies in MongoDB.
            </p>
          </div>

          <button
            onClick={fetchLimits}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>

        {/* Top Banner Allocation Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total User Seats Granted</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{totalUsersAllocated} Users</div>
            <p className="text-[10px] text-gray-500 mt-1">Across {companies.length} tenants</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Project Slots Allocated</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{totalProjectsAllocated} Layouts</div>
            <p className="text-[10px] text-gray-500 mt-1">Active site capacity</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Multi-Tenant Quota Enforcer</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">Enforced</div>
            <p className="text-[10px] text-gray-500 mt-1">Strict limit ceiling active</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search company or email..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {filtered.length} companies
          </span>
        </div>

        {/* Limits Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[950px]">
                <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Company Name</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Plan Tier</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Max Staff User Limit</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Max Project Limit</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Quota Policy</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filtered.length > 0 ? (
                    filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {c.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold text-[#102A2E] text-xs block whitespace-nowrap">{c.name}</span>
                              <span className="text-gray-400 text-[11px] whitespace-nowrap">{c.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap ${
                            (c.plan || '').includes('Enterprise')
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : (c.plan || '').includes('Standard')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {c.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="font-extrabold text-[#102A2E] text-sm">{c.maxUsers}</span>
                            <span className="text-gray-400 text-[11px]">Staff Users</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="font-extrabold text-[#102A2E] text-sm">{c.maxProjects}</span>
                            <span className="text-gray-400 text-[11px]">Sites / Townships</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            <HiOutlineShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Sandboxed Quota
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleEditLimits(c)}
                            className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-bold rounded-xl transition-all text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                          >
                            <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Adjust Limits
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No company limits found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          )}
        </div>

      </div>
    </MainLayout>
  );
};
