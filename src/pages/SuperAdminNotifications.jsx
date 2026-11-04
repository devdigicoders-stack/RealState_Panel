import React, { useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';

export const SuperAdminNotifications = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Company Plan Expiry Alert', desc: 'Royal Heritage Builders plan expired on 10 Oct 2026. Auto-renewal failed.', time: '10 mins ago', type: 'urgent' },
    { id: 2, title: 'New Tenant Provisioned', desc: 'Skyline Townships Ltd. successfully registered with Enterprise Pro.', time: '2 hours ago', type: 'success' },
    { id: 3, title: 'Telephony Threshold 80%', desc: 'Exotel cloud PBX bandwidth consumed 82% of monthly allocated pool.', time: 'Yesterday', type: 'warning' },
  ]);

  return (
    <MainLayout title="System Notifications & Broadcasts">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#102A2E]">Broadcasts & Alerts</h2>
          <p className="text-xs text-gray-500 mt-0.5">Critical system events, renewal alerts, and infrastructure warnings.</p>
        </div>
        <button
          onClick={() => {
            setAlerts([]);
            toast.info('All notifications cleared');
          }}
          className="text-xs font-bold text-gray-500 hover:text-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${a.type === 'urgent' ? 'bg-red-500' : a.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <h4 className="font-extrabold text-sm text-[#102A2E]">{a.title}</h4>
                <span className="text-[10px] text-gray-400">• {a.time}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1 pl-4">{a.desc}</p>
            </div>
            <button
              onClick={() => setAlerts(alerts.filter(x => x.id !== a.id))}
              className="text-gray-400 hover:text-red-500 p-2"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

