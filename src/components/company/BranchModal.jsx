import React, { useState, useEffect } from 'react';
import {
  HiOutlineX,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineKey
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { isValidEmail, isValidPhone, cleanDigits } from '../../utils/validation';

export const BranchModal = ({ isOpen, onClose, onSave, branch = null, mode = 'create' }) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const [activeTab, setActiveTab] = useState(1);

  const defaultForm = {
    // 1. Basic Information
    name: '',
    branchCode: `BR-${Math.floor(100 + Math.random() * 900)}`,
    branchType: 'Sales Office', // Head Office / Regional Office / Sales Office / Site Office
    status: 'Active', // Active / Inactive
    openingDate: new Date().toISOString().split('T')[0],
    description: '',

    // 2. Contact Information
    phone: '',
    alternatePhone: '',
    email: '',
    website: '',

    // 3. Address
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    pinCode: '226001',
    googleMapsLocation: '',

    // 4. Branch Manager Details
    managerMode: 'new', // new / existing
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    managerPassword: '',
    managerDesignation: 'Branch Manager',
    managerJoiningDate: new Date().toISOString().split('T')[0],

    // 5. Operations
    assignedProjects: ['Royal Palms Township', 'Omaxe Residency'],
    assignedSalesTeams: ['North Sales Wing', 'Alpha Telecallers'],
    numberOfEmployees: 8,
    workingDays: 'Monday - Saturday',
    openingTime: '09:30 AM',
    closingTime: '06:30 PM',
    operationsNotes: '',

    // 6. Settings
    settings: {
      allowLeadAssignment: true,
      allowPropertyManagement: true,
      allowBookingManagement: true,
      allowAgentManagement: true,
      allowPaymentManagement: true,
      allowReportsAccess: true
    }
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [showManagerPassword, setShowManagerPassword] = useState(false);

  useEffect(() => {
    if (branch) {
      setFormData({
        ...defaultForm,
        ...branch,
        managerPassword: branch.managerPassword || '',
        settings: {
          ...defaultForm.settings,
          ...(branch.settings || {})
        }
      });
    } else {
      setFormData(defaultForm);
    }
    setActiveTab(1);
    setErrors({});
  }, [branch, isOpen]);

  // Tab-specific validity checks
  const isTab1Valid = () => {
    return !!formData.name?.trim() && !!formData.branchType;
  };

  const isTab2Valid = () => {
    return isValidPhone(formData.phone) && (!formData.email || isValidEmail(formData.email));
  };

  const isTab3Valid = () => {
    return (
      !!formData.addressLine1?.trim() &&
      !!formData.city?.trim() &&
      !!formData.state?.trim() &&
      cleanDigits(formData.pinCode).length === 6
    );
  };

  const isTab4Valid = () => {
    return (
      !!formData.managerName?.trim() &&
      isValidEmail(formData.managerEmail)
    );
  };

  const canGoNext = () => {
    if (activeTab === 1) return isTab1Valid();
    if (activeTab === 2) return isTab2Valid();
    if (activeTab === 3) return isTab3Valid();
    if (activeTab === 4) return isTab4Valid();
    return true;
  };

  const isFormValid = () => {
    return isTab1Valid() && isTab2Valid() && isTab3Valid() && isTab4Valid();
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Branch Name is required';
    if (!isValidPhone(formData.phone)) errs.phone = 'Valid 10-digit phone number is required';
    if (formData.email && !isValidEmail(formData.email)) errs.email = 'Valid branch email address required';
    if (!formData.addressLine1?.trim()) errs.addressLine1 = 'Address Line 1 is required';
    if (!formData.city?.trim()) errs.city = 'City is required';
    if (!formData.state?.trim()) errs.state = 'State is required';
    if (cleanDigits(formData.pinCode).length !== 6) errs.pinCode = 'Valid 6-digit PIN Code required';
    if (!formData.managerName?.trim()) errs.managerName = 'Manager Name is required';
    if (!isValidEmail(formData.managerEmail)) errs.managerEmail = 'Valid manager email address required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors marked with *');
      return;
    }
    onSave(formData);
  };

  const tabs = [
    { id: 1, name: '1. Basic Info', icon: HiOutlineOfficeBuilding },
    { id: 2, name: '2. Contact', icon: HiOutlinePhone },
    { id: 3, name: '3. Address', icon: HiOutlineLocationMarker },
    { id: 4, name: '4. Manager Details', icon: HiOutlineUser },
    { id: 5, name: '5. Operations', icon: HiOutlineBriefcase },
    { id: 6, name: '6. Permissions', icon: HiOutlineCog }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg text-[#D6A84B] font-black border border-white/20">
              <HiOutlineOfficeBuilding className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  {isView ? `Branch Profile: ${formData.name}` : isEdit ? `Edit Branch: ${formData.name}` : 'Add New Branch (6-Step Dossier)'}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-[#D6A84B]">
                  {formData.branchCode}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    formData.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-red-500/20 text-red-300 border border-red-400/40'
                  }`}
                >
                  ● {formData.status}
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Configure branch identity, operational coverage, team assignments & role permissions
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

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50/80 px-4 py-2 shrink-0 scrollbar-none gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive ? 'bg-[#0F766E] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-gray-700">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Gomti Nagar Regional HQ"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Code (Auto Generate)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.branchCode}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-xl font-mono font-bold text-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Type</label>
                  <select
                    disabled={isView}
                    value={formData.branchType}
                    onChange={(e) => setFormData({ ...formData, branchType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Head Office">Head Office</option>
                    <option value="Regional Office">Regional Office</option>
                    <option value="Sales Office">Sales Office</option>
                    <option value="Site Office">Site Office</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Status</label>
                  <select
                    disabled={isView}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Opening Date</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.openingDate}
                    onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Branch Description</label>
                <textarea
                  rows="3"
                  disabled={isView}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Primary regional office handling East Lucknow townships..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT INFORMATION */}
          {activeTab === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Contact Number *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 522 2345678"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Alternate Contact Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Email Address</label>
                  <input
                    type="email"
                    disabled={isView}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="branch.gomti@developer.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Website (Optional)</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://developer.com/branches/gomti"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRANCH ADDRESS */}
          {activeTab === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Plot 101, Cyber Heights, Vibhuti Khand"
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${
                    errors.addressLine1 ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                  }`}
                />
                {errors.addressLine1 && <p className="text-red-500 text-[10px] mt-1">{errors.addressLine1}</p>}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Near High Court, Gomti Nagar"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.state ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.city ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-xl outline-none font-mono ${
                      errors.pinCode ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Google Maps Location URL (Optional)</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.googleMapsLocation}
                  onChange={(e) => setFormData({ ...formData, googleMapsLocation: e.target.value })}
                  placeholder="https://maps.google.com/?q=26.85,80.94"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BRANCH MANAGER DETAILS */}
          {activeTab === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Manager Full Name *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="e.g. Vikas Mehrotra"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.managerName ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.managerName && <p className="text-red-500 text-[10px] mt-1">{errors.managerName}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Manager Designation</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.managerDesignation}
                    onChange={(e) => setFormData({ ...formData, managerDesignation: e.target.value })}
                    placeholder="Branch Manager / Regional Head"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Manager Mobile Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Manager Login Email *</label>
                  <input
                    type="email"
                    disabled={isView}
                    value={formData.managerEmail}
                    onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                    placeholder="manager.branch@developer.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Manager Login Password</label>
                  <div className="relative">
                    <input
                      type={showManagerPassword ? 'text' : 'password'}
                      disabled={isView}
                      value={formData.managerPassword}
                      onChange={(e) => setFormData({ ...formData, managerPassword: e.target.value })}
                      placeholder="e.g. Pass@1234"
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowManagerPassword(!showManagerPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showManagerPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  disabled={isView}
                  value={formData.managerJoiningDate}
                  onChange={(e) => setFormData({ ...formData, managerJoiningDate: e.target.value })}
                  className="w-full sm:w-1/3 px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          )}

          {/* TAB 5: BRANCH OPERATIONS */}
          {activeTab === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Number of Staff / Employees</label>
                  <input
                    type="number"
                    min="1"
                    disabled={isView}
                    value={formData.numberOfEmployees}
                    onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Working Days</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.workingDays}
                    onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                    placeholder="Monday - Saturday"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    placeholder="09:30 AM"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    placeholder="06:30 PM"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Branch Operational Notes</label>
                <textarea
                  rows="3"
                  disabled={isView}
                  value={formData.operationsNotes}
                  onChange={(e) => setFormData({ ...formData, operationsNotes: e.target.value })}
                  placeholder="Branch handles special weekend investor visits and VIP bookings..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          )}

          {/* TAB 6: BRANCH SETTINGS & PERMISSIONS */}
          {activeTab === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-gray-500 text-xs">
                Toggle operational privileges and access control allowed for this branch:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { key: 'allowLeadAssignment', label: 'Allow Lead Assignment & Distribution' },
                  { key: 'allowPropertyManagement', label: 'Allow Property & Plot Management' },
                  { key: 'allowBookingManagement', label: 'Allow Plot Booking & Token Processing' },
                  { key: 'allowAgentManagement', label: 'Allow Channel Partner (Agent) Management' },
                  { key: 'allowPaymentManagement', label: 'Allow Payment Collection & Receipts' },
                  { key: 'allowReportsAccess', label: 'Allow Operational Reports Access' }
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-800 text-xs">{item.label}</span>
                    <input
                      type="checkbox"
                      disabled={isView}
                      checked={formData.settings?.[item.key] ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, [item.key]: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-[#0F766E] rounded focus:ring-0 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {activeTab > 1 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab - 1)}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                ← Back
              </button>
            )}
            {activeTab < 6 && (
              <button
                type="button"
                disabled={!canGoNext()}
                onClick={() => {
                  if (canGoNext()) {
                    setActiveTab(activeTab + 1);
                  } else {
                    toast.warning('Please fill in required fields correctly before proceeding to next step');
                  }
                }}
                className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  canGoNext()
                    ? 'bg-[#102A2E] text-white hover:bg-[#0F766E] cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                Next Step →
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button
                type="button"
                disabled={!isFormValid()}
                onClick={handleSubmit}
                className={`px-5 py-2 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                  isFormValid()
                    ? 'bg-[#0F766E] hover:bg-[#102A2E] text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                <HiOutlineCheck className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Create Branch'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
