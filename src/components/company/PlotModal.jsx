import React, { useState, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlineLocationMarker, 
  HiOutlineCurrencyRupee,
  HiOutlineCheck,
  HiOutlineClock
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const PlotModal = ({ isOpen, onClose, onSave, plot = null, mode = 'create' }) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const defaultForm = {
    plotNo: '',
    size: '1200 sqft',
    dims: '30x40',
    facing: 'East Facing',
    rate: '₹2,450/sqft',
    total: '₹29,40,000',
    status: 'Available',
    bookedBy: '',
    holdBy: '',
    registeredTo: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plot) {
      setFormData({ ...defaultForm, ...plot });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
  }, [plot, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.plotNo?.trim()) errs.plotNo = 'Plot Number is mandatory (e.g. A-14)';
    if (!formData.size?.trim()) errs.size = 'Plot Size is mandatory';
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
              <HiOutlineLocationMarker className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isView ? `Plot Unit: ${formData.plotNo}` : isEdit ? `Edit Plot: ${formData.plotNo}` : 'Add New Plot Unit'}
              </h3>
              <p className="text-[11px] text-white/80">
                Plot dimensions, facing, square footage pricing, and live hold timers
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

        {/* View Mode */}
        {isView ? (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border">{formData.id}</span>
                <div className="text-2xl font-black text-[#102A2E] mt-1">{formData.plotNo}</div>
                <div className="text-gray-500 font-semibold">{formData.size} ({formData.dims})</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                formData.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                formData.status === 'Temporary Hold' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-800'
              }`}>
                {formData.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Orientation / Facing</span>
                <div className="font-bold text-[#102A2E] text-xs mt-0.5">{formData.facing}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Rate / sqft</span>
                <div className="font-bold text-gray-800 text-xs mt-0.5">{formData.rate}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Unit Valuation</span>
                <div className="font-black text-[#0F766E] text-base mt-0.5">{formData.total}</div>
              </div>
            </div>

            {formData.bookedBy && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Booked By:</span>
                <div className="font-bold text-emerald-900 mt-0.5">{formData.bookedBy}</div>
              </div>
            )}
            {formData.holdBy && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Temporary 24h Hold:</span>
                  <div className="font-bold text-amber-900 mt-0.5">{formData.holdBy}</div>
                </div>
                <HiOutlineClock className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
            )}
          </div>
        ) : (
          /* Form Mode */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Plot Number *</label>
                <input
                  type="text"
                  value={formData.plotNo}
                  onChange={(e) => {
                    setFormData({ ...formData, plotNo: e.target.value });
                    if (errors.plotNo) setErrors({ ...errors, plotNo: null });
                  }}
                  placeholder="e.g. A-14 or Commercial-02"
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${
                    errors.plotNo ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
                />
                {errors.plotNo && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.plotNo}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Area Size (sqft) *</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g. 1500 sqft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Dimensions (LxW)</label>
                <input
                  type="text"
                  value={formData.dims}
                  onChange={(e) => setFormData({ ...formData, dims: e.target.value })}
                  placeholder="30x50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Facing / Location</label>
                <select
                  value={formData.facing}
                  onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>East Facing</option>
                  <option>North Facing</option>
                  <option>West Facing</option>
                  <option>Park Facing Corner</option>
                  <option>Main 60ft Road</option>
                  <option>Dual Road Corner</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Rate / sqft</label>
                <input
                  type="text"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="₹2,450/sqft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-bold text-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Available</option>
                  <option>Temporary Hold</option>
                  <option>Booked</option>
                  <option>Registered</option>
                </select>
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
                <span>{isEdit ? 'Update Unit' : 'Save Plot Unit'}</span>
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
              Close Unit Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

