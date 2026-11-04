import React, { useState, useEffect } from 'react';
import { superAdminService } from '../services/superAdminService';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlineChevronRight,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const CompanyFormModal = ({ isOpen, onClose, onSave, initialData = null, companyData = null, availablePlans = [] }) => {
  const activeData = initialData || companyData;
  const [formStep, setFormStep] = useState(1);
  const isEdit = Boolean(activeData && (activeData.id || activeData._id));
  const [plansList, setPlansList] = useState(availablePlans);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const defaultForm = {
    name: '',
    tagline: 'Leading Real Estate Developers',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    website: 'https://',
    plan: '',
    billingCycle: 'Annual (15% Off)',
    maxUsers: '',
    maxProjects: '',
    callingIntegration: 'Exotel Cloud PBX',
    smsProvider: 'Gupshup Gateway',
    autoCallRecording: true,
    allowChannelPartnerPortal: true,
    storageQuota: '25 GB'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  // Helper to sync or preselect plan
  const syncWithPlans = (plans, currentPlanName) => {
    if (!plans || plans.length === 0) return;
    
    // If a plan is already selected or provided
    const targetPlan = currentPlanName 
      ? plans.find(p => p.name?.toLowerCase() === currentPlanName?.toLowerCase())
      : (plans.length === 1 ? plans[0] : null);

    if (targetPlan) {
      setFormData(prev => ({
        ...prev,
        plan: targetPlan.name,
        maxUsers: prev.maxUsers !== '' && prev.maxUsers !== 15 ? prev.maxUsers : (targetPlan.userLimit || targetPlan.users || 10),
        maxProjects: prev.maxProjects !== '' && prev.maxProjects !== 5 ? prev.maxProjects : (targetPlan.projectLimit || targetPlan.projs || 3)
      }));
    }
  };

  // Fetch plans from API if not passed or empty
  useEffect(() => {
    if (isOpen) {
      if (availablePlans && availablePlans.length > 0) {
        setPlansList(availablePlans);
        if (!activeData && availablePlans.length === 1) {
          syncWithPlans(availablePlans, null);
        }
      } else {
        setLoadingPlans(true);
        superAdminService.getPlans().then(res => {
          if (res && res.success && Array.isArray(res.data)) {
            setPlansList(res.data);
            if (!activeData && res.data.length === 1) {
              syncWithPlans(res.data, null);
            }
          }
        }).catch(err => {
          console.error('Failed to load plans in modal:', err);
        }).finally(() => {
          setLoadingPlans(false);
        });
      }
    }
  }, [isOpen, availablePlans]);

  useEffect(() => {
    if (activeData) {
      setFormData({
        ...defaultForm,
        ...activeData,
        name: activeData.name || '',
        ownerName: activeData.ownerName || '',
        email: activeData.email || '',
        phone: activeData.phone || '',
        plan: activeData.plan || '',
        maxUsers: activeData.usersLimit ?? activeData.maxUsers ?? 10,
        maxProjects: activeData.projectsLimit ?? activeData.maxProjects ?? 3,
        callingIntegration: activeData.callingProvider || activeData.callingIntegration || 'Exotel Cloud PBX',
        smsProvider: activeData.smsProvider || 'Gupshup Gateway',
        status: activeData.status || 'Active'
      });
    } else {
      // If there is only one plan configured in database, pre-select it with its real quotas
      const singlePlan = (availablePlans?.length === 1 ? availablePlans[0] : (plansList?.length === 1 ? plansList[0] : null));
      setFormData({
        ...defaultForm,
        plan: singlePlan ? singlePlan.name : '',
        maxUsers: singlePlan ? (singlePlan.userLimit || 5) : '',
        maxProjects: singlePlan ? (singlePlan.projectLimit || 2) : ''
      });
    }
    setFormStep(1);
    setErrors({});
  }, [activeData, isOpen]);

  if (!isOpen) return null;

  // Real-time Field Validations
  const validateStep1 = () => {
    const errs = {};

    // Company Name
    if (!formData.name?.trim()) {
      errs.name = 'Company Name is mandatory';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Company name must be at least 3 characters';
    }

    // Owner Name
    if (!formData.ownerName?.trim()) {
      errs.ownerName = 'Director / Owner name is mandatory';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      errs.email = 'Admin Email is mandatory';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address (e.g. name@company.com)';
    }

    // Password validation (required for new companies; optional for edit, but if entered must be >= 6)
    if (!isEdit) {
      if (!formData.password?.trim()) {
        errs.password = 'Initial Login Password is required';
      } else if (formData.password.trim().length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
    } else {
      if (formData.password?.trim() && formData.password.trim().length < 6) {
        errs.password = 'New password must be at least 6 characters';
      }
    }

    // Mobile Phone validation (Indian 10-digit standard or +91 format)
    const rawPhone = formData.phone.replace(/[\s\-\+\(\)]/g, '');
    if (!formData.phone?.trim()) {
      errs.phone = 'Contact Mobile number is mandatory';
    } else if (rawPhone.length < 10 || rawPhone.length > 13) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }

    // City
    if (!formData.city?.trim()) {
      errs.city = 'City is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.plan || !formData.plan.trim()) {
      errs.plan = 'Subscription Tier plan is required. Please select a plan before continuing.';
    }
    if (Number(formData.maxUsers) < 1) {
      errs.maxUsers = 'User seat count must be at least 1';
    }
    if (Number(formData.maxProjects) < 1) {
      errs.maxProjects = 'Project limit must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (formStep === 1) {
      if (!validateStep1()) {
        toast.error('Please fix validation errors in Step 1');
        return;
      }
      setFormStep(2);
    } else if (formStep === 2) {
      if (!validateStep2()) {
        toast.error('Please fix quota numbers in Step 2');
        return;
      }
      setFormStep(3);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      setFormStep(1);
      toast.error('Please fix details in Step 1');
      return;
    }
    if (!validateStep2()) {
      setFormStep(2);
      toast.error('Please fix details in Step 2');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="p-5 bg-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6A84B] to-[#B58B35] text-[#102A2E] flex items-center justify-center font-black">
              <HiOutlineOfficeBuilding className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isEdit ? `Edit Company: ${formData.name}` : 'Onboard New Real Estate Company'}
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                {isEdit ? 'Update tenant settings, quotas and telephony connection' : 'Setup dedicated  tenant, plan quota, and calling integrations'}
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

        {/* Wizard Steps Navigation */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setFormStep(1)}
            className={`flex items-center gap-2 ${formStep === 1 ? 'text-[#0F766E] font-bold' : 'text-gray-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep === 1 ? 'bg-[#0F766E] text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
            <span>1. Profile & Contacts</span>
          </button>

          <div className="h-0.5 w-10 bg-gray-200" />

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setFormStep(2);
              else toast.error('Complete Step 1 first');
            }}
            className={`flex items-center gap-2 ${formStep === 2 ? 'text-[#0F766E] font-bold' : 'text-gray-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep === 2 ? 'bg-[#0F766E] text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
            <span>2. Plan & Capacity</span>
          </button>

          <div className="h-0.5 w-10 bg-gray-200" />

          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setFormStep(3);
              else toast.error('Complete previous steps first');
            }}
            className={`flex items-center gap-2 ${formStep === 3 ? 'text-[#0F766E] font-bold' : 'text-gray-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep === 3 ? 'bg-[#0F766E] text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
            <span>3. Gateways & Telephony</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">

          {/* STEP 1 */}
          {formStep === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Company / Developer Name *</label>
                  <div className="relative">
                    <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="e.g. Apex Infratech Developers"
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                        }`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Premium Plots & Luxury Townships"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Owner / Director Full Name *</label>
                  <div className="relative">
                    <HiOutlineUser className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => {
                        setFormData({ ...formData, ownerName: e.target.value });
                        if (errors.ownerName) setErrors({ ...errors, ownerName: null });
                      }}
                      placeholder="e.g. Vikram Singhania"
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none transition-all ${errors.ownerName ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                        }`}
                    />
                  </div>
                  {errors.ownerName && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Official Mobile (10 Digits) *</label>
                  <div className="relative">
                    <HiOutlinePhone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                        }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-gray-700">Company Admin Login Email *</label>
                    {isEdit && <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Locked (Non-editable)</span>}
                  </div>
                  <div className="relative">
                    <HiOutlineMail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled={isEdit}
                      value={formData.email}
                      onChange={(e) => {
                        if (!isEdit) {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }
                      }}
                      placeholder="admin@developergroup.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                        isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' :
                        errors.email ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    {isEdit ? 'Reset / Update Password (Optional)' : 'Initial Login Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      placeholder={isEdit ? 'Leave blank to keep existing' : 'e.g. password123'}
                      className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                        }`}
                    />
                  </div>
                  {errors.password ? (
                    <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.password}</p>
                  ) : (
                    <p className="text-[9px] text-gray-400 mt-0.5">This password will be used by Owner to login</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: null });
                    }}
                    placeholder="e.g. Lucknow / Delhi NCR"
                    className={`w-full px-3 py-2 text-xs border rounded-xl outline-none ${errors.city ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#0F766E]'
                      }`}
                  />
                  {errors.city && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Official Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {formStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-gray-700">Select Subscription Tier *</label>
                  {errors.plan && (
                    <span className="text-[10px] text-red-600 font-bold">{errors.plan}</span>
                  )}
                </div>

                {loadingPlans ? (
                  <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
                    Loading subscription plans from MongoDB...
                  </div>
                ) : plansList.length === 0 ? (
                  <div className="p-6 text-center bg-amber-50 rounded-2xl border border-amber-200">
                    <p className="text-xs font-bold text-amber-800">No Subscription Plans Available in Database!</p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Please configure and publish plans in <strong>"Subscription Plans"</strong> before onboarding a company.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plansList.map((p) => {
                      const isSelected = formData.plan === p.name;
                      const priceFormatted = `₹${Number(p.price || 0).toLocaleString('en-IN')}/${p.duration || 'mo'}`;
                      const users = p.userLimit ?? p.users ?? p.maxUsers ?? 5;
                      const projs = p.projectLimit ?? p.projs ?? p.maxProjects ?? 2;

                      return (
                        <div
                          key={p._id || p.id || p.name}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              plan: p.name,
                              maxUsers: users,
                              maxProjects: projs
                            });
                            if (errors.plan) setErrors({ ...errors, plan: null });
                          }}
                          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#0F766E] bg-[#0F766E]/5 ring-2 ring-[#0F766E] shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="font-extrabold text-xs text-[#102A2E] capitalize">{p.name}</div>
                          <div className="text-sm font-black text-[#0F766E] mt-1">{priceFormatted}</div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {users} Users • {projs} Projects
                          </div>
                          {p.badge && (
                            <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Max User Seat Allowance</label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-bold text-[#102A2E]"
                  />
                  {errors.maxUsers && <p className="text-[10px] text-red-600 mt-1">{errors.maxUsers}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Max Active Projects / Layouts</label>
                  <input
                    type="number"
                    value={formData.maxProjects}
                    onChange={(e) => setFormData({ ...formData, maxProjects: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-bold text-[#102A2E]"
                  />
                  {errors.maxProjects && <p className="text-[10px] text-red-600 mt-1">{errors.maxProjects}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Cloud Storage Quota</label>
                  <select
                    value={formData.storageQuota}
                    onChange={(e) => setFormData({ ...formData, storageQuota: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  >
                    <option value="10 GB">10 GB Secure Cloud</option>
                    <option value="25 GB">25 GB High Speed Storage</option>
                    <option value="50 GB">50 GB Enterprise Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  >
                    <option value="Annual (15% Off)">Annual Pre-Paid (15% Off)</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly Auto-Debit</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {formStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Telephony Gateway (Click-to-Call)</label>
                  <select
                    value={formData.callingIntegration}
                    onChange={(e) => setFormData({ ...formData, callingIntegration: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-semibold text-gray-800"
                  >
                    <option value="Exotel Cloud PBX">Exotel Click-to-Call PBX</option>
                    <option value="Tata Tele Smartflo">Tata Tele Smartflo Cloud</option>
                    <option value="Knowlarity SuperReceptionist">Knowlarity Virtual Receptionist</option>
                    <option value="Custom SIP Trunk">Custom SIP Trunk / Astrix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">WhatsApp & SMS DLT Gateway</label>
                  <select
                    value={formData.smsProvider}
                    onChange={(e) => setFormData({ ...formData, smsProvider: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-semibold text-gray-800"
                  >
                    <option value="Gupshup Gateway">Gupshup Enterprise DLT</option>
                    <option value="Twilio Global SMS">Twilio Cloud API</option>
                    <option value="Textlocal FastSMS">Textlocal India DLT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoCallRecording}
                    onChange={(e) => setFormData({ ...formData, autoCallRecording: e.target.checked })}
                    className="w-4 h-4 text-[#0F766E] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Auto Call Recording & Cloud Storage</div>
                    <div className="text-[10px] text-gray-500">Enable automatic audio recording for Telecaller & Sales executives</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowChannelPartnerPortal}
                    onChange={(e) => setFormData({ ...formData, allowChannelPartnerPortal: e.target.checked })}
                    className="w-4 h-4 text-[#0F766E] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Enable Channel Partner (Broker) Login</div>
                    <div className="text-[10px] text-gray-500">Brokers can register customers, book plots, and view earned commission</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {formStep > 1 ? (
              <button
                type="button"
                onClick={() => setFormStep(formStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Back Step
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}

            {formStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-[#0F766E] text-white rounded-xl text-xs font-bold hover:bg-[#102A2E] shadow-sm flex items-center gap-1.5"
              >
                <span>Continue</span>
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#0F766E] to-[#102A2E] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#0F766E]/20 hover:opacity-95 flex items-center gap-2 cursor-pointer"
              >
                <HiOutlineSparkles className="w-4 h-4 text-[#D6A84B]" />
                <span>{isEdit ? 'Save Changes' : 'Confirm & Onboard'}</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

