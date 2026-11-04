import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { HighchartsWrapper } from '../../components/HighchartsWrapper';
import { managerService } from '../../services/managerService';
import { toast } from 'react-toastify';
import {
  HiOutlineDocumentReport,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiOutlineTrendingUp,
  HiOutlineRefresh
} from 'react-icons/hi';

export const ManagerPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalVolume, setTotalVolume] = useState('₹0');
  const [branchInfo, setBranchInfo] = useState(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await managerService.getPerformance();
      if (res.success) {
        setLeaderboard(res.data || []);
        setTotalVolume(res.totalVolumeFormatted || '₹0');
        setBranchInfo(res.branch);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load team performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // Performance Comparison Chart
  const chartOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 280 },
    title: { text: null },
    xAxis: {
      categories: leaderboard.map(l => l.name),
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: 'bold' } }
    },
    yAxis: {
      title: { text: 'Metrics Count', style: { color: '#64748B', fontSize: '11px' } },
      gridLineColor: '#F1F5F9'
    },
    series: [
      {
        name: 'Calls Delivered',
        data: leaderboard.map(l => l.callsMade),
        color: '#3B82F6'
      },
      {
        name: 'Site Visits Done',
        data: leaderboard.map(l => l.visitsDone),
        color: '#0F766E'
      },
      {
        name: 'Tokens Booked',
        data: leaderboard.map(l => l.tokensBooked),
        color: '#D6A84B'
      }
    ],
    credits: { enabled: false }
  };

  return (
    <MainLayout title="Team Sales Performance & Conversion Metrics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#102A2E] tracking-tight">
            Sales Team Performance & Leaderboard {branchInfo?.name ? `(${branchInfo.name})` : ''}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit live telecaller activity, physical site tour ratios, and individual sales executive revenue contribution.
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Leaderboard
        </button>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs mb-8">
        <h3 className="font-extrabold text-[#102A2E] text-sm mb-3">Executive Productivity Metrics Comparison</h3>
        <HighchartsWrapper options={chartOptions} />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-[#102A2E] text-xs uppercase tracking-wider">
            Branch Executive Conversion Leaderboard
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Total Closed Volume: {totalVolume}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-500 mt-3">Computing live leaderboard stats...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No executive performance data logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 whitespace-nowrap">
              <thead className="bg-[#102A2E] text-white uppercase font-bold tracking-wider text-[11px] whitespace-nowrap">
                <tr>
                  <th className="py-3.5 px-5">Rank</th>
                  <th className="py-3.5 px-5">Sales Executive</th>
                  <th className="py-3.5 px-5">Role / Badge</th>
                  <th className="py-3.5 px-5">Calls Delivered</th>
                  <th className="py-3.5 px-5">Site Visits Escorted</th>
                  <th className="py-3.5 px-5">Tokens Booked</th>
                  <th className="py-3.5 px-5">Gross Volume</th>
                  <th className="py-3.5 px-5 text-center">Visit → Booking Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {leaderboard.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                          m.rank === '1'
                            ? 'bg-[#D6A84B] text-[#102A2E]'
                            : m.rank === '2'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.rank}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-[#102A2E] text-xs">
                      {m.name}
                    </td>

                    <td className="py-3.5 px-5 text-gray-500">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {m.badge}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono font-bold text-blue-600">{m.callsMade}</td>

                    <td className="py-3.5 px-5 font-mono font-bold text-[#0F766E]">{m.visitsDone}</td>

                    <td className="py-3.5 px-5 font-mono font-black text-purple-700">{m.tokensBooked}</td>

                    <td className="py-3.5 px-5 font-mono font-black text-emerald-700">{m.volume}</td>

                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold rounded-full border border-emerald-200 text-[10px]">
                        {m.conversionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
