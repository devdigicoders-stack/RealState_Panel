import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton, Skeleton } from '../components/Skeleton';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineUserGroup,
  HiOutlineCash,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlinePlus
} from 'react-icons/hi';

export const CompanyAdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const [metrics] = useState({
    totalLeads: 142,
    activeFollowups: 28,
    scheduledVisits: 12,
    totalPlots: 84,
    availablePlots: 36,
    bookedPlots: 41,
    holdPlots: 7,
    revenueCollected: '₹1.84 Cr',
    pendingInstallments: '₹62 Lakh',
    activeAgents: 19
  });

  return (
    <MainLayout title="Company Admin / Owner Dashboard">
      {/* Company Header Card */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#102A2E] to-[#0E3A40] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0F766E] text-[#D6A84B] text-[10px] font-bold uppercase tracking-wider mb-2">
            Company Tenant Management
          </div>
          <h2 className="text-xl font-black">{user?.companyName || 'ABC Developers Pvt. Ltd.'}</h2>
          <p className="text-xs text-emerald-200/80 mt-1 max-w-xl">
            Executive control of projects, plot layout inventory, telecallers, site visit executives, and finance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              Swal.fire({
                title: 'Add New Project / Township',
                input: 'text',
                inputLabel: 'Project Name',
                inputPlaceholder: 'e.g. Royal Meadows Phase 2',
                confirmButtonColor: '#0F766E',
                showCancelButton: true
              }).then(r => {
                if (r.isConfirmed && r.value) toast.success(`Project "${r.value}" initiated!`);
              });
            }}
            className="px-4 py-2 rounded-xl bg-[#D6A84B] hover:bg-[#B58B35] text-[#102A2E] font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <HiOutlinePlus className="w-4 h-4" /> Create Project
          </button>
          <button
            onClick={() => toast.success('Lead assignment automation active')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20"
          >
            Auto Lead Routing
          </button>
        </div>
      </div>

      {/* KPI Cards with Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total CRM Leads</span>
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                <HiOutlineUserGroup className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">{metrics.totalLeads}</span>
              <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{metrics.activeFollowups} Pending Calls
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">From Facebook, Portals, Brokers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plots Availability</span>
              <div className="w-10 h-10 rounded-xl bg-[#D6A84B]/15 text-[#D6A84B] flex items-center justify-center">
                <HiOutlineLocationMarker className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">{metrics.availablePlots} Available</span>
              <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {metrics.bookedPlots} Sold
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Out of {metrics.totalPlots} total plotted area</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Site Visits Planned</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HiOutlineCalendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">{metrics.scheduledVisits} This Week</span>
              <span className="ml-2 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                7 Completed
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Driver & Site Executive mapped</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Finance & Bookings</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center">
                <HiOutlineCash className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#102A2E]">{metrics.revenueCollected}</span>
              <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {metrics.pendingInstallments} Due
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Token, Registry & Installments</p>
          </div>
        </div>
      )}

      {/* Plot Status Live Visualizer */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#102A2E]">Live Plot Inventory Matrix</h3>
            <p className="text-xs text-gray-500 mt-0.5">Plot grid with real-time status updates (Available, Hold, Booked, Registered)</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-500"></span> On Hold</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-red-500"></span> Booked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-gray-500"></span> Registered</span>
          </div>
        </div>

        {/* 16 Plots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 pt-2">
          {isLoading ? (
            Array.from({ length: 16 }).map((_, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-3 w-10 rounded-full" />
              </div>
            ))
          ) : (
            [
              { num: 'P-101', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Booked', customer: 'R. Sharma' },
              { num: 'P-102', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Available' },
              { num: 'P-103', size: '1500 Sqft', rate: '₹2,600/sqft', status: 'Available' },
              { num: 'P-104', size: '1500 Sqft', rate: '₹2,600/sqft', status: 'Hold', customer: 'A. Verma' },
              { num: 'P-105', size: '1800 Sqft', rate: '₹2,800/sqft', status: 'Registered', customer: 'S. Patel' },
              { num: 'P-106', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Available' },
              { num: 'P-107', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Booked', customer: 'V. Gupta' },
              { num: 'P-108', size: '2000 Sqft', rate: '₹3,000/sqft', status: 'Available' },
              { num: 'P-109', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Hold', customer: 'K. Mehra' },
              { num: 'P-110', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Available' },
              { num: 'P-111', size: '1500 Sqft', rate: '₹2,600/sqft', status: 'Booked', customer: 'M. Khan' },
              { num: 'P-112', size: '1500 Sqft', rate: '₹2,600/sqft', status: 'Available' },
              { num: 'P-113', size: '1800 Sqft', rate: '₹2,800/sqft', status: 'Available' },
              { num: 'P-114', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Registered', customer: 'D. Sen' },
              { num: 'P-115', size: '1200 Sqft', rate: '₹2,400/sqft', status: 'Available' },
              { num: 'P-116', size: '2400 Sqft', rate: '₹3,200/sqft', status: 'Available' },
            ].map((plot, i) => {
              const colorClass = 
                plot.status === 'Available' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' :
                plot.status === 'Hold' ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100' :
                plot.status === 'Booked' ? 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100' :
                'bg-gray-100 border-gray-300 text-gray-700';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      title: `Plot: ${plot.num}`,
                      html: `
                        <div class="text-left text-sm space-y-2 p-2">
                          <p><strong>Status:</strong> ${plot.status}</p>
                          <p><strong>Dimension:</strong> ${plot.size}</p>
                          <p><strong>Base Rate:</strong> ${plot.rate}</p>
                          ${plot.customer ? `<p><strong>Buyer / Lead:</strong> ${plot.customer}</p>` : ''}
                        </div>
                      `,
                      icon: 'info',
                      confirmButtonColor: '#0F766E'
                    });
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${colorClass}`}
                >
                  <span className="font-extrabold text-xs">{plot.num}</span>
                  <span className="text-[10px] font-medium opacity-80">{plot.size}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider mt-1 px-1.5 py-0.5 rounded bg-white/60">
                    {plot.status}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};
