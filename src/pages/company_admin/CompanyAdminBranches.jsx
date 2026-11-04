import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { BranchModal } from '../../components/company/BranchModal';
import { Pagination } from '../../components/common/Pagination';
import { ViewToggle } from '../../components/common/ViewToggle';
import { companyAdminService } from '../../services/companyAdminService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineRefresh
} from 'react-icons/hi';

export const CompanyAdminBranches = () => {
  const navigate = useNavigate();
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getBranches({ search: searchTerm });
      if (res.success && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchTerm]);

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditBranch = (br) => {
    setSelectedBranch(br);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewBranch = (br) => {
    navigate(`/company_admin/branches/${br._id || br.id}`);
  };

  const handleSaveBranch = async (brData) => {
    try {
      if (modalMode === 'edit' && selectedBranch) {
        const id = selectedBranch._id || selectedBranch.id;
        const res = await companyAdminService.updateBranch(id, brData);
        if (res.success) {
          setIsModalOpen(false);
          toast.success(res.message || 'Branch updated successfully!');
          await fetchBranches();
        }
      } else {
        const res = await companyAdminService.createBranch(brData);
        if (res.success) {
          setIsModalOpen(false);
          toast.success(res.message || 'Branch registered successfully!');
          await fetchBranches();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save branch');
    }
  };

  const handleToggleBranchStatus = async (branch) => {
    const isCurrentlyActive = branch.status === 'Active' || branch.status?.includes('Active') || branch.status === 'Primary HQ';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    Swal.fire({
      title: `${newStatus === 'Inactive' ? 'Deactivate' : 'Activate'} Branch?`,
      text: `Are you sure you want to mark "${branch.name}" as ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Active' ? '#0F766E' : '#d33',
      confirmButtonText: `Yes, Mark ${newStatus}`,
      cancelButtonText: 'Cancel'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.updateBranch(branch._id || branch.id, { status: newStatus });
          if (res.success) {
            toast.success(`Branch status changed to ${newStatus}`);
            fetchBranches();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update branch status');
        }
      }
    });
  };

  const handleDeleteBranch = (id, name) => {
    Swal.fire({
      title: `Delete Branch: ${name}?`,
      text: 'Are you sure you want to remove this branch office location from MongoDB?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deleteBranch(id);
          if (res.success) {
            toast.info(`Branch "${name}" deleted`);
            fetchBranches();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete branch');
        }
      }
    });
  };

  const filtered = branches.filter(b =>
    (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedBranches = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Company Branches & Regional Site Pavilions">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Branch Offices</span>
          <div className="text-2xl font-black text-[#102A2E] mt-1">{branches.length} Locations</div>
          <p className="text-[10px] text-gray-500 mt-1">HQ & Regional Gallerie(s)</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#0F766E] uppercase">Total Active Staff</span>
          <div className="text-2xl font-black text-[#0F766E] mt-1">Active Staff Allocated</div>
          <p className="text-[10px] text-emerald-500 mt-1">On-site branch deployment</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Primary Headquarters</span>
          <div className="text-2xl font-black text-[#D6A84B] mt-1">
            {branches.find(b => b.status === 'Primary HQ')?.city || 'Corporate City'}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Central Corporate Hub</p>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Branches & Regional Sales Galleries</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              {branches.length} Registered Locations
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner manages corporate headquarters, regional site offices, customer lounges, and allocated staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBranches}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleAddBranch}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by branch name, city, or in-charge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
          />
        </div>

        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 mt-3">Loading live branches from database...</p>
        </div>
      ) : paginatedBranches.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Branch Offices Found</p>
          <p className="text-xs text-gray-400 mt-1">Register your first branch or site sales gallery office.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Branch Identity</th>
                  <th className="py-3 px-4">Origin / Added By</th>
                  <th className="py-3 px-4">City / Region</th>
                  <th className="py-3 px-4">Branch In-Charge</th>
                  <th className="py-3 px-4">Staff Quota</th>
                  <th className="py-3 px-4">Projects Covered</th>
                  <th className="py-3 px-4">Operational Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedBranches.map((br) => (
                  <tr key={br._id || br.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black">
                          <HiOutlineOfficeBuilding className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#102A2E] text-xs flex items-center gap-2">
                            <span>{br.name}</span>
                            <span className="font-mono text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
                              {br.branchCode || br.branchId || br.id || 'BR'}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <HiOutlineLocationMarker className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{br.addressLine1 || br.address || 'Address not listed'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        {br.addedBy || 'Company Admin'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-900">{br.city}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{br.contactPerson}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5"><HiOutlinePhone className="w-3 h-3 text-[#0F766E]" /> {br.phone}</span>
                        {br.email && <span className="flex items-center gap-0.5"><HiOutlineMail className="w-3 h-3 text-gray-400" /> {br.email}</span>}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F766E] flex items-center gap-1">
                        <HiOutlineUsers className="w-3.5 h-3.5" />
                        <span>{br.staffCount}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-semibold">{br.projectsCovered}</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleBranchStatus(br)}
                        title="Click to toggle Active / Inactive"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105 ${
                          br.status === 'Inactive'
                            ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                        }`}
                      >
                        ● {br.status === 'Inactive' ? 'Inactive' : 'Active'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewBranch(br)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditBranch(br)}
                          className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                          title="Edit Branch"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(br._id || br.id, br.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Branch"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBranches.map((br) => (
            <div key={br._id || br.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-[#0F766E]/50 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black">
                      <HiOutlineOfficeBuilding className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#102A2E] text-sm">{br.name}</h3>
                      <p className="text-[10px] text-gray-400">{br.city} • {br.branchId || br.id || 'BR'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleBranchStatus(br)}
                    title="Click to toggle status"
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider cursor-pointer hover:scale-105 transition-all ${
                      br.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    ● {br.status === 'Inactive' ? 'Inactive' : 'Active'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{br.address}</p>

                <div className="space-y-1.5 text-xs pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">In-Charge:</span>
                    <span className="font-bold text-gray-800">{br.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-mono text-[#0F766E] font-bold">{br.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quota:</span>
                    <span className="font-bold text-gray-700">{br.staffCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewBranch(br)}
                  className="text-xs font-bold text-gray-600 hover:text-[#102A2E] flex items-center gap-1 cursor-pointer"
                >
                  <HiOutlineEye className="w-4 h-4" /> View
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBranch(br)}
                    className="p-1.5 bg-gray-100 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] rounded-xl transition-all cursor-pointer"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(br._id || br.id, br.name)}
                    className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={filtered.length}
        />
      )}

      {/* Branch Modal (Create / Edit / View) */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBranch}
        branch={selectedBranch}
        mode={modalMode}
      />
    </MainLayout>
  );
};

export default CompanyAdminBranches;
