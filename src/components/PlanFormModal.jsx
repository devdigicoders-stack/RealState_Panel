import React, { useState, useEffect } from 'react';
import {
  HiOutlineCreditCard,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineTrash
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const PlanFormModal = ({ isOpen, onClose, onSave, initialData = null, planData = null }) => {
  const activeData = planData || initialData;
  const isEdit = Boolean(activeData && (activeData.id || activeData._id));

  const defaultForm = {
    name: '',
    price: '',
    duration: 'Monthly',
    userLimit: 10,
    projectLimit: 3,
    storageLimit: '10 GB',
    isPopular: false,
    status: 'Active',
    features: [
      'Property & Plot CRM',
      'Lead Management Pipeline',
      'Site Visit Planner'
    ]
  };

  const [formData, setFormData] = useState(defaultForm);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeData) {
      setFormData({
        ...defaultForm,
        ...activeData,
        id: activeData.id || activeData._id,
        features: Array.isArray(activeData.features) ? activeData.features : defaultForm.features
      });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
    setNewFeatureInput('');
  }, [activeData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) {
      errs.name = 'Plan Name is required';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errs.price = 'Valid pricing amount is required';
    }
    if (Number(formData.userLimit) < 1) {
      errs.userLimit = 'User seat count must be at least 1';
    }
    if (Number(formData.projectLimit) < 1) {
      errs.projectLimit = 'Project limit must be at least 1';
    }
    if (!formData.features || formData.features.length === 0) {
      errs.features = 'Add at least one feature item';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormData({
      ...formData,
      features: [...formData.features, newFeatureInput.trim()]
    });
    setNewFeatureInput('');
    if (errors.features) setErrors({ ...errors, features: null });
  };

  const handleRemoveFeature = (indexToRemove) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix form validation errors');
      return;
    }

    onSave({
      ...formData,
      price: Number(formData.price),
      userLimit: Number(formData.userLimit),
      projectLimit: Number(formData.projectLimit)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#102A2E] to-[#0F766E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6A84B] to-[#B58B35] text-[#102A2E] flex items-center justify-center font-black shadow-md">
              <HiOutlineCreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isEdit ? `Edit Subscription Tier: ${formData.name}` : 'Create New Subscription Tier'}
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                Configure  package price, user allowances, project caps, and module perks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">

          {/* Plan Name & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Plan / Tier Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="e.g. Starter, Growth Pro, Enterprise"
                className={`w-full px-3 py-2 border rounded-xl outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
              />
              {errors.name && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Price in INR (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors({ ...errors, price: null });
                }}
                placeholder="e.g. 14999"
                className={`w-full px-3 py-2 border rounded-xl outline-none font-bold text-[#0F766E] transition-all ${errors.price ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
              />
              {errors.price && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.price}</p>}
            </div>
          </div>

          {/* Billing Duration & Status */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Billing Frequency</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly (Annual)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Tier Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
              >
                <option value="Active">Active (Available for purchase)</option>
                <option value="Inactive">Inactive / Hidden</option>
              </select>
            </div>
          </div>

          {/* Quotas: Users & Projects */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Company User Limits (Staff Seats) *</label>
              <input
                type="number"
                value={formData.userLimit}
                onChange={(e) => {
                  setFormData({ ...formData, userLimit: e.target.value });
                  if (errors.userLimit) setErrors({ ...errors, userLimit: null });
                }}
                className={`w-full px-3 py-2 border rounded-xl outline-none font-bold text-[#102A2E] ${errors.userLimit ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
              />
              {errors.userLimit && <p className="text-[10px] text-red-600 mt-1">{errors.userLimit}</p>}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Company Project Limits (Sites) *</label>
              <input
                type="number"
                value={formData.projectLimit}
                onChange={(e) => {
                  setFormData({ ...formData, projectLimit: e.target.value });
                  if (errors.projectLimit) setErrors({ ...errors, projectLimit: null });
                }}
                className={`w-full px-3 py-2 border rounded-xl outline-none font-bold text-[#102A2E] ${errors.projectLimit ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                  }`}
              />
              {errors.projectLimit && <p className="text-[10px] text-red-600 mt-1">{errors.projectLimit}</p>}
            </div>
          </div>

          {/* Featured / Popular Badge Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4 text-[#0F766E] rounded"
              />
              <div>
                <span className="font-bold text-gray-800 block text-xs">Mark as "Most Popular / Recommended"</span>
                <span className="text-[10px] text-gray-500">Highlights this plan with a Premium Gold ribbon on checkout</span>
              </div>
            </label>
          </div>

          {/* Features Management List */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block font-bold text-gray-700 mb-1.5">Included Modules & Perks *</label>

            {/* Input to add new feature */}
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Cloud Telephony Click-to-Call PBX"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-[#0F766E] text-white rounded-xl font-bold flex items-center gap-1 hover:bg-[#102A2E] transition-colors"
              >
                <HiOutlinePlus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* List of features */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {formData.features.map((feat, index) => (
                <div key={index} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-gray-700 font-medium">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Remove feature"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {errors.features && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.features}</p>}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#0F766E] to-[#102A2E] text-white rounded-xl font-extrabold shadow-md shadow-[#0F766E]/20 hover:opacity-95 flex items-center gap-2 cursor-pointer"
            >
              <HiOutlineSparkles className="w-4 h-4 text-[#D6A84B]" />
              <span>{isEdit ? 'Save Plan Changes' : 'Publish Subscription Plan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

