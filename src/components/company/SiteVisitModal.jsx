import React, { useState, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlineCalendar, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineLocationMarker, 
  HiOutlineCheck,
  HiOutlineClock
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const SiteVisitModal = ({ isOpen, onClose, onSave, visit = null, mode = 'create' }) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const defaultForm = {
    client: '',
    phone: '',
    project: 'Royal Palm Township',
    scheduledDate: 'Sunday, 11:30 AM',
    pickupLocation: 'Hazratganj Main Office',
    vehicle: 'Swift Dzire (UP32 AB 1234)',
    assignedExecutive: 'Amit Kumar (Sales Exec)',
    status: 'Scheduled',
    feedback: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visit) {
      setFormData({ ...defaultForm, ...visit });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
  }, [visit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.client?.trim()) errs.client = 'Client Name is mandatory';
    const rawPhone = (formData.phone || '').replace(/[\s\-\+\(\)]/g, '');
    if (!formData.phone?.trim() || rawPhone.length < 10) errs.phone = 'Valid 10-digit number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg text-[#D6A84B] font-black border border-white/20">
              <HiOutlineCalendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isView ? `Site Visit: ${formData.client}` : isEdit ? `Edit Site Visit: ${formData.client}` : 'Schedule Client Site Visit'}
              </h3>
              <p className="text-[11px] text-white/80">
                Logistics, pickup car mapping, escort sales executive, and feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {isView ? (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border">{formData.id}</span>
                <div className="text-lg font-black text-[#102A2E] mt-1">{formData.client}</div>
                <div className="text-gray-500 font-mono mt-0.5">{formData.phone}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {formData.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Target Project</span>
                <div className="font-bold text-[#102A2E] text-xs mt-0.5">{formData.project}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Scheduled Time</span>
                <div className="font-bold text-purple-700 text-xs mt-0.5">{formData.scheduledDate}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pickup Location</span>
                <div className="font-bold text-gray-800 text-xs mt-0.5">{formData.pickupLocation}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Escort Sales Staff</span>
                <div className="font-bold text-[#0F766E] text-xs mt-0.5">{formData.assignedExecutive}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Client Visit Feedback</span>
              <p className="text-xs text-gray-700 mt-1 italic">{formData.feedback || 'Pending visit completion'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => {
                    setFormData({ ...formData, client: e.target.value });
                    if (errors.client) setErrors({ ...errors, client: null });
                  }}
                  placeholder="e.g. Ramesh Chandra"
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${
                    errors.client ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
                />
                {errors.client && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.client}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${
                    errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Target Project</label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Royal Palm Township</option>
                  <option>Greenview Heights Villa Enclave</option>
                  <option>Emerald Commercial Strip</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Scheduled Date & Time</label>
                <input
                  type="text"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  placeholder="Sunday, 11:30 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Pickup Vehicle / Point</label>
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  placeholder="e.g. Hazratganj Office"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Escort Sales Staff</label>
                <select
                  value={formData.assignedExecutive}
                  onChange={(e) => setFormData({ ...formData, assignedExecutive: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Amit Kumar (Sales Exec)</option>
                  <option>Vikash Tiwari (Sr. Executive)</option>
                  <option>Manoj Patel (Field Rep)</option>
                  <option>Rajesh Sharma (Sales Manager)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Rescheduled / Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Feedback Outcome</label>
                <input
                  type="text"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  placeholder="Client feedback after tour..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <HiOutlineCheck className="w-4 h-4" />
                <span>{isEdit ? 'Update Tour' : 'Dispatch Site Visit'}</span>
              </button>
            </div>
          </form>
        )}

        {isView && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#102A2E] text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Close Visit Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

