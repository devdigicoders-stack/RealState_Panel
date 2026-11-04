import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Pagination } from '../../components/common/Pagination';
import { ViewToggle } from '../../components/common/ViewToggle';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { agentService } from '../../services/agentService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineDownload,
  HiOutlineEye
} from 'react-icons/hi';

export const AgentProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await agentService.getProjects();
      if (res && res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load agent projects', err);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDownloadBrochure = (proj) => {
    toast.info(`Preparing marketing brochure and plot layout for "${proj.name}"...`);
  };

  const handleViewDetails = (proj) => {
    Swal.fire({
      title: proj.name,
      html: `
        <div class="text-left text-xs space-y-2 p-3 bg-gray-50 rounded-xl">
          <p><strong>📍 Location:</strong> ${proj.location || 'N/A'}</p>
          <p><strong>📋 Type:</strong> ${proj.type || 'Township / Plotted Enclave'}</p>
          <p><strong>🏛️ RERA Reg:</strong> ${proj.reraNo || proj.reraRegistrationNumber || 'Under Process'}</p>
          <p><strong>📐 Total Plots:</strong> ${proj.totalPlots || 0} Units</p>
          <p><strong>🟢 Available Plots:</strong> <span class="text-emerald-700 font-bold">${proj.availablePlots || 0} Available</span></p>
          <p><strong>💰 Base Rate:</strong> <span class="text-[#0F766E] font-bold">${proj.baseRate || (proj.pricePerSqFt ? `₹${proj.pricePerSqFt}/Sq.ft` : '₹2,200 / Sq.ft')}</span></p>
          <p><strong>✨ CP Commission:</strong> <span class="text-amber-700 font-bold">${proj.commissionOffer || '2.0% - 2.5% Approved Payout'}</span></p>
        </div>
      `,
      confirmButtonText: 'Got it',
      confirmButtonColor: '#0F766E'
    });
  };

  const filtered = projects.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.reraNo || p.reraRegistrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlotsAvailable = projects.reduce((acc, curr) => acc + (Number(curr.availablePlots) || 0), 0);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout title="Assigned Company Projects & Inventory">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
            <HiOutlineOfficeBuilding className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Live Projects</p>
            <p className="text-xl font-extrabold text-[#102A2E]">{projects.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HiOutlineLocationMarker className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Plots Available</p>
            <p className="text-xl font-extrabold text-[#102A2E]">{totalPlotsAvailable} Units</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <span className="text-xs font-black">CP%</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Broker Commission</p>
            <p className="text-xl font-extrabold text-amber-700">2.0% - 2.5%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <HiOutlineDownload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Collateral</p>
            <p className="text-xl font-extrabold text-[#102A2E]">Digital Ready</p>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search projects by name, location..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {isLoading ? (
        viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <TableSkeleton rows={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <HiOutlineOfficeBuilding className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h4 className="font-bold text-gray-700">No Projects Found</h4>
          <p className="text-xs text-gray-400 mt-1">There are currently no active projects available in your company branch.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A2E] text-white font-semibold">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Project ID</th>
                  <th className="py-3 px-4 whitespace-nowrap">Project Name & Type</th>
                  <th className="py-3 px-4 whitespace-nowrap">Location</th>
                  <th className="py-3 px-4 whitespace-nowrap">Inventory Available</th>
                  <th className="py-3 px-4 whitespace-nowrap">Base Rate</th>
                  <th className="py-3 px-4 whitespace-nowrap">Broker Commission</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginated.map((proj) => (
                  <tr key={proj._id || proj.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-500 whitespace-nowrap">
                      {proj.projectId || proj.code || 'PROJ'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-[#102A2E]">{proj.name}</div>
                      <div className="text-[11px] text-gray-400">{proj.type || 'Township / Plotted'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-700">
                      📍 {proj.location || 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#0F766E]">{proj.availablePlots || 0} Plots Left</span>
                      <span className="text-[11px] text-gray-400"> of {proj.totalPlots || 0}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-800">
                      {proj.baseRate || (proj.pricePerSqFt ? `₹${proj.pricePerSqFt} / Sq.ft` : '₹2,200 / Sq.ft')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-amber-700">
                      💰 {proj.commissionOffer || '2.0% - 2.5%'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadBrochure(proj)}
                          title="Download Brochure"
                          className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                        >
                          <HiOutlineDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetails(proj)}
                          className="px-2.5 py-1 bg-[#0F766E] text-white rounded-lg font-bold hover:bg-[#102A2E] cursor-pointer"
                        >
                          Inspect
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {paginated.map((proj) => (
            <div key={proj._id || proj.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-gray-400">{proj.projectId || proj.code || 'PROJ'}</span>
                <h3 className="font-extrabold text-base text-[#102A2E] mt-1">{proj.name}</h3>
                <p className="text-xs text-gray-500 font-medium">📍 {proj.location || 'N/A'}</p>

                <div className="my-3 p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                  <div><span className="text-gray-400">Available:</span> <span className="font-bold text-[#0F766E]">{proj.availablePlots || 0} of {proj.totalPlots || 0} Plots</span></div>
                  <div><span className="text-gray-400">Starting:</span> <span className="font-bold text-gray-800">{proj.baseRate || (proj.pricePerSqFt ? `₹${proj.pricePerSqFt} / Sq.ft` : '₹2,200 / Sq.ft')}</span></div>
                  <div><span className="text-gray-400">Commission:</span> <span className="font-bold text-amber-700">{proj.commissionOffer || '2.0% - 2.5%'}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleDownloadBrochure(proj)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                  <span>Brochure</span>
                </button>
                <button
                  onClick={() => handleViewDetails(proj)}
                  className="px-4 py-2 bg-[#0F766E] text-white hover:bg-[#102A2E] rounded-xl font-bold text-xs cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Pagination */}
      {!isLoading && filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        />
      )}
    </MainLayout>
  );
};
