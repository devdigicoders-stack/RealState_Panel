import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { superAdminService } from '../services/superAdminService';
import { 
  HiOutlineSupport, 
  HiOutlinePlus, 
  HiOutlineSearch, 
  HiOutlineFilter,
  HiOutlineCheckCircle, 
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineChatAlt2,
  HiOutlineRefresh
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const SuperAdminSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getSupportTickets();
      if (res && res.success && Array.isArray(res.data)) {
        setTickets(res.data.map(t => ({
          ...t,
          id: t._id || t.id
        })));
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      toast.error('Failed to fetch support tickets from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, nextStatus) => {
    try {
      await superAdminService.updateSupportTicketStatus(ticketId, nextStatus);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
      toast.success(`Ticket status updated to ${nextStatus} in MongoDB!`);
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket status');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      (t.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ticketNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout title="Platform Support & Tenant Helpdesk">
      <div className="space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#102A2E] tracking-tight">Tenant Inquiries & Technical Helpdesk</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live ticketing queue for resolving tenant builder escalations, quota expansions, and telephony queries.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Reload from MongoDB"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>

        {/* Top Banner Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Tickets</span>
            <div className="text-2xl font-black text-[#102A2E] mt-1">{tickets.length} Inquiries</div>
            <p className="text-[10px] text-gray-500 mt-1">Tenant tickets logged</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase">In Progress / Pending</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {tickets.filter(t => t.status === 'In Progress' || t.status === 'Open').length} Active
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Under investigation</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase">Resolved Tickets</span>
            <div className="text-2xl font-black text-[#0F766E] mt-1">
              {tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length} Closed
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Average resolution &lt; 2h</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-purple-600 uppercase">SLA Adherence</span>
            <div className="text-2xl font-black text-purple-700 mt-1">99.4%</div>
            <p className="text-[10px] text-gray-500 mt-1">Priority ticket response</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ticket #, subject or company..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Status:</span>
            <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold whitespace-nowrap">
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st ? 'bg-white text-[#102A2E] shadow-xs font-bold' : 'text-gray-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[950px]">
                <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Ticket #</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tenant Organization</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Inquiry Subject</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedTickets.length > 0 ? (
                    paginatedTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#102A2E] whitespace-nowrap">
                          {t.ticketNo}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-extrabold text-[#102A2E] block text-xs whitespace-nowrap">{t.company}</span>
                          <span className="text-gray-400 text-[10px] whitespace-nowrap">{t.submittedBy}</span>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm truncate whitespace-nowrap font-medium text-gray-800">
                          {t.subject}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">
                            {t.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            t.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {t.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Resolved' || t.status === 'Closed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {t.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className="p-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white cursor-pointer"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No support tickets found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filteredTickets.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredTickets.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={() => {}}
            />
          )}
        </div>

      </div>
    </MainLayout>
  );
};
