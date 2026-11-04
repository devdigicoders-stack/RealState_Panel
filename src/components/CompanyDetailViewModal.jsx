import React from 'react';
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineMail, 
  HiOutlineLocationMarker, 
  HiOutlineGlobeAlt, 
  HiOutlineCreditCard, 
  HiOutlineServer,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck
} from 'react-icons/hi';

export const CompanyDetailViewModal = ({ isOpen, onClose, company, onEdit }) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#102A2E] to-[#0F766E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D6A84B] to-[#B58B35] text-[#102A2E] flex items-center justify-center font-black text-lg shadow-md">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">{company.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  company.status === 'Active' ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-red-400/20 text-red-200'
                }`}>
                  {company.status}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">{company.tagline || 'Registered Real Estate Tenant'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: Director & Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <HiOutlineUser className="w-4 h-4 text-[#0F766E]" /> Owner & Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Director / Owner:</span>
                <span className="font-extrabold text-[#102A2E] text-sm">{company.ownerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Official Mobile:</span>
                <span className="font-bold text-gray-800">{company.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Administrator Email:</span>
                <span className="font-bold text-[#0F766E]">{company.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Headquarter Location:</span>
                <span className="font-bold text-gray-800">{company.city || 'Lucknow / Delhi NCR'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Subscription & Limits Quota */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <HiOutlineCreditCard className="w-4 h-4 text-[#D6A84B]" /> Subscription & Quota Limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-2xl border border-gray-200 bg-white">
                <span className="text-[11px] text-gray-400 font-semibold block">Subscribed Plan</span>
                <span className="text-sm font-black text-[#102A2E] mt-1 block">{company.plan}</span>
                <span className="text-xs font-extrabold text-[#0F766E]">{company.planPrice}</span>
              </div>

              <div className="p-3.5 rounded-2xl border border-gray-200 bg-white">
                <span className="text-[11px] text-gray-400 font-semibold block">Team Users Limit</span>
                <span className="text-sm font-black text-[#102A2E] mt-1 block">
                  {company.usersCount} / {company.maxUsers} Seats
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Managers & Telecallers</span>
              </div>

              <div className="p-3.5 rounded-2xl border border-gray-200 bg-white">
                <span className="text-[11px] text-gray-400 font-semibold block">Project Sites Limit</span>
                <span className="text-sm font-black text-[#102A2E] mt-1 block">
                  {company.projectsCount} / {company.maxProjects} Sites
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Townships Allowed</span>
              </div>
            </div>
          </div>

          {/* Section 3: Telephony & Gateways */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <HiOutlineServer className="w-4 h-4 text-[#0F766E]" /> Telephony & Communication Gateways
            </h4>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Calling Provider (VoIP Click-to-Dial):</span>
                <span className="font-bold text-[#102A2E] bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                  {company.callingIntegration}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">WhatsApp & SMS Gateway:</span>
                <span className="font-bold text-[#102A2E] bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                  {company.smsProvider}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Cloud Storage Allocation:</span>
                <span className="font-bold text-gray-700">{company.storageUsed || '10 GB High Speed'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">License Expiration:</span>
                <span className="font-extrabold text-[#D6A84B]">{company.expiryDate} (Joined: {company.joinedDate})</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close Window
          </button>
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(company);
            }}
            className="px-5 py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            Edit Company Details
          </button>
        </div>

      </div>
    </div>
  );
};

