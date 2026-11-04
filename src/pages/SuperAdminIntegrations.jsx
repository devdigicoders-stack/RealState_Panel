import React, { useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { HiOutlinePhone, HiOutlineChatAlt2, HiOutlineKey, HiOutlineCheck } from 'react-icons/hi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export const SuperAdminIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    { name: 'Exotel Telephony PBX', type: 'Click-to-Call Cloud VoIP', status: 'Connected', key: 'EXO_LIVE_902148', lastSync: 'Healthy (4ms)' },
    { name: 'Tata Tele Smartflo', type: 'Virtual Numbers & Call Routing', status: 'Connected', key: 'TATA_PRO_88190', lastSync: 'Healthy (6ms)' },
    { name: 'Gupshup WhatsApp & SMS', type: 'Transactional DLT Gateway', status: 'Connected', key: 'GUP_PROD_199201', lastSync: 'Healthy (2ms)' },
    { name: 'Twilio Cloud Telephony', type: 'International SMS & Calling', status: 'Standby', key: 'TWL_TEST_44910', lastSync: 'Configured' },
  ]);

  const handleConfigure = (item) => {
    Swal.fire({
      title: `Configure ${item.name}`,
      html: `
        <div class="text-left text-xs space-y-3 p-2">
          <label class="block font-bold">API Key / SID:</label>
          <input id="api-key" class="w-full p-2 border rounded font-mono" value="${item.key}" />
          <label class="block font-bold">Webhook URL:</label>
          <input class="w-full p-2 border rounded font-mono text-[11px]" readonly value="https://api.crm.com/webhooks/telephony" />
        </div>
      `,
      confirmButtonText: 'Save API Keys',
      confirmButtonColor: '#0F766E',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) toast.success(`${item.name} gateway updated!`);
    });
  };

  return (
    <MainLayout title="Telecom & Third-Party Integrations">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-[#102A2E]">Telephony & SMS API Gateways</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage global API credentials, webhooks, and VoIP server uptime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">{item.type}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.status}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#102A2E]">{item.name}</h3>
              <p className="text-xs font-mono text-gray-500 mt-1">API Key: {item.key}</p>
              <div className="text-[11px] text-gray-400 mt-2 font-medium">Latency & Health: {item.lastSync}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleConfigure(item)}
                className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-lg text-xs font-bold transition-colors"
              >
                Configure Credentials
              </button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

