import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { ProjectModal } from '../../components/company/ProjectModal';
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
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineRefresh
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

export const CompanyAdminProjects = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProject, setSelectedProject] = useState(null);

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPlots: 0,
    availablePlots: 0
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await companyAdminService.getProjects({ search: searchTerm });
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm]);

  const handleCreateProject = () => {
    setSelectedProject(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditProject = (p) => {
    setSelectedProject(p);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewProject = (p) => {
    setSelectedProject(p);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleSaveProject = async (pData) => {
    try {
      if (modalMode === 'edit' && selectedProject) {
        const id = selectedProject._id || selectedProject.id;
        const res = await companyAdminService.updateProject(id, pData);
        if (res.success) {
          toast.success(res.message || 'Project updated successfully!');
          fetchProjects();
        }
      } else {
        const res = await companyAdminService.createProject(pData);
        if (res.success) {
          toast.success(res.message || 'Project registered successfully!');
          fetchProjects();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = (id, name) => {
    Swal.fire({
      title: `Delete Project: ${name}?`,
      text: 'Are you sure? This will also remove associated plot inventory records from MongoDB!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete Project'
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await companyAdminService.deleteProject(id);
          if (res.success) {
            toast.info(`Project "${name}" and inventory deleted`);
            fetchProjects();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete project');
        }
      }
    });
  };

  const filtered = projects.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.reraNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedProjects = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Townships & Plotted Assets">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Active Real Estate Projects</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{stats.totalProjects || projects.length} Townships</div>
            <p className="text-[10px] text-gray-500 mt-1">Multi-site land parcels</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
            <HiOutlineOfficeBuilding className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Total Mapped Plots</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">{stats.totalPlots} Units</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Plotted inventory catalog</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center">
            <HiOutlineDocumentText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#D6A84B] uppercase">Plots Ready for Sale</span>
            <div className="text-2xl font-black text-[#D6A84B] mt-1">{stats.availablePlots} Available</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Direct booking ready</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D6A84B] flex items-center justify-center">
            <HiOutlineLocationMarker className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">Townships & Land Assets Directory</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Live Database ({projects.length})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Owner configures layouts, plot inventory numbers, RERA credentials, and marketing amenities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleCreateProject}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by project name, location, or RERA..."
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
          <p className="text-xs font-bold text-gray-500 mt-3">Loading projects from live database...</p>
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
          <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No Projects Found</p>
          <p className="text-xs text-gray-400 mt-1">Register your first real estate project or township.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project & Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">RERA Registration</th>
                  <th className="py-3 px-4">Plots (Avail / Total)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedProjects.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-black">
                          <HiOutlineOfficeBuilding className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#102A2E] text-xs">{p.name}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <HiOutlineLocationMarker className="w-3 h-3 text-gray-400" />
                            <span>{p.location}{p.city ? `, ${p.city}` : ''}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800">{p.type || 'Township'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border">
                        {p.reraNo || 'RERA Pending'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">
                        <strong className="text-[#0F766E]">{p.availablePlots || 0}</strong> / {p.totalPlots || 0} Plots
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {p.bookedPlots || 0} Booked • {p.holdPlots || 0} Hold
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● {p.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to="/company_admin/plots"
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[#0F766E] hover:text-white rounded-lg text-[10px] font-bold text-gray-700 transition-colors"
                          title="View Plot Matrix"
                        >
                          Matrix
                        </Link>
                        <button
                          onClick={() => handleViewProject(p)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer transition-colors"
                          title="View Project Dossier"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProject(p)}
                          className="p-1.5 hover:bg-[#0F766E]/10 text-[#0F766E] rounded-lg cursor-pointer transition-colors"
                          title="Edit Project"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p._id || p.id, p.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Project"
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
          {paginatedProjects.map((p) => (
            <div key={p._id || p.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-[#0F766E]/50 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-extrabold text-[#102A2E] text-sm">{p.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.location}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    {p.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">RERA No:</span>
                    <span className="font-mono font-bold text-gray-800">{p.reraNo || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Plots:</span>
                    <span className="font-bold text-gray-800">{p.totalPlots || 0} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="font-bold text-[#0F766E]">{p.availablePlots || 0} Ready to Book</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <Link
                  to="/company_admin/plots"
                  className="text-xs font-bold text-[#0F766E] hover:underline"
                >
                  Open Plots →
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleViewProject(p)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all cursor-pointer"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditProject(p)}
                    className="p-1.5 bg-gray-100 hover:bg-[#0F766E]/10 text-gray-600 hover:text-[#0F766E] rounded-xl transition-all cursor-pointer"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(p._id || p.id, p.name)}
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

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        project={selectedProject}
        mode={modalMode}
      />

    </MainLayout>
  );
};

export default CompanyAdminProjects;
