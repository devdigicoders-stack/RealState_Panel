import React, { useState, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlineOfficeBuilding, 
  HiOutlineLocationMarker, 
  HiOutlineCurrencyRupee,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineTrash
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const ProjectModal = ({ isOpen, onClose, onSave, project = null, mode = 'create' }) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const defaultForm = {
    name: '',
    location: '',
    type: 'Gated Residential Township',
    reraNo: 'UPRERAAGT',
    totalPlots: 80,
    availablePlots: 80,
    bookedPlots: 0,
    ratePerSqft: '₹2,450 / sqft',
    sizeRange: '1000 - 2500 sqft',
    amenities: ['24x7 Security & CCTV', '60ft Wide Main Road', 'Park & Clubhouse'],
    status: 'Active / Selling Fast'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [newAmenity, setNewAmenity] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({ ...defaultForm, ...project });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Project Name is mandatory';
    if (!formData.location?.trim()) errs.location = 'Project Location is mandatory';
    if (Number(formData.totalPlots) < 1) errs.totalPlots = 'Plots count must be at least 1';
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

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, idx) => idx !== index)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg text-[#D6A84B] font-black border border-white/20">
              <HiOutlineOfficeBuilding className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isView ? `Project: ${formData.name}` : isEdit ? `Edit Project: ${formData.name}` : 'Initiate New Township Project'}
              </h3>
              <p className="text-[11px] text-white/80">
                {isView ? 'Site overview, plot capacity, pricing, and infrastructure' : 'Configure layout dimensions, base rate/sqft, and RERA registration'}
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
                <div className="text-lg font-black text-[#102A2E] mt-1">{formData.name}</div>
                <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                  <HiOutlineLocationMarker className="w-4 h-4 text-[#0F766E]" />
                  <span>{formData.location}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {formData.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Base Rate</span>
                <div className="font-black text-[#0F766E] text-sm mt-0.5">{formData.ratePerSqft}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Plot Sizes</span>
                <div className="font-bold text-[#102A2E] text-xs mt-0.5">{formData.sizeRange}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Available Units</span>
                <div className="font-black text-emerald-700 text-sm mt-0.5">{formData.availablePlots} Plots</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">RERA ID</span>
                <div className="font-mono font-bold text-gray-800 text-[11px] mt-0.5">{formData.reraNo}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Amenities & Infrastructure:</span>
              <div className="flex flex-wrap gap-1.5">
                {formData.amenities.map((am, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white text-gray-700 font-bold rounded-lg border border-gray-200 text-xs">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Create / Edit Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  placeholder="e.g. Royal Palm Township Phase 2"
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${
                    errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Project Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) setErrors({ ...errors, location: null });
                  }}
                  placeholder="e.g. Sultanpur Road, Lucknow"
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${
                    errors.location ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
                />
                {errors.location && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.location}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">RERA License Number</label>
                <input
                  type="text"
                  value={formData.reraNo}
                  onChange={(e) => setFormData({ ...formData, reraNo: e.target.value })}
                  placeholder="UPRERAAGT..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Base Rate / sqft</label>
                <input
                  type="text"
                  value={formData.ratePerSqft}
                  onChange={(e) => setFormData({ ...formData, ratePerSqft: e.target.value })}
                  placeholder="e.g. ₹2,450 / sqft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-bold text-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Total Plots Count *</label>
                <input
                  type="number"
                  value={formData.totalPlots}
                  onChange={(e) => setFormData({ ...formData, totalPlots: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Plot Dimensions & Range</label>
              <input
                type="text"
                value={formData.sizeRange}
                onChange={(e) => setFormData({ ...formData, sizeRange: e.target.value })}
                placeholder="e.g. 1000 - 2500 sqft (30x40, 30x50, 40x60)"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Key Amenities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add amenity (e.g. Street Lights, Clubhouse)"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-3 py-1.5 bg-[#0F766E] text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.amenities.map((am, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-[11px] border">
                    <span>{am}</span>
                    <button type="button" onClick={() => removeAmenity(i)} className="text-gray-400 hover:text-red-500 cursor-pointer">×</button>
                  </span>
                ))}
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
                <span>{isEdit ? 'Update Project' : 'Publish Project'}</span>
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
              Close Project Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

