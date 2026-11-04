import React, { useState, useEffect } from 'react';
import {
  HiOutlineX,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineCash,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePhotograph
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { FilePicker } from '../common/FilePicker';
import { isValidEmail, isValidPhone, cleanDigits } from '../../utils/validation';

export const AgentModal = ({
  isOpen,
  onClose,
  onSave,
  onApproveReject,
  agent = null,
  mode = 'create',
  isManager = false,
  branches = []
}) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const [activeTab, setActiveTab] = useState(1);

  const defaultForm = {
    // 1. Basic Information
    fullName: '',
    profilePhoto: '',
    agentType: 'Individual', // Individual / Agency
    gender: 'Male',
    dob: '',
    agencyName: '',
    agentCode: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
    designation: 'Channel Partner',
    branchId: '',
    branchName: '',

    // 2. Contact Information
    phone: '',
    alternatePhone: '',
    email: '',
    whatsappNumber: '',
    officeAddress: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pinCode: '',

    // 3. Identity & KYC Details
    panNumber: '',
    aadhaarNumber: '',
    gstNumber: '',
    panCardDoc: '',
    aadhaarCardDoc: '',
    profilePhotoDoc: '',
    addressProofDoc: '',
    kycStatus: 'Pending Verification',

    // 4. Professional Information
    experienceYears: '2-4 Years',
    previousCompany: '',
    areaOfOperation: '',
    preferredPropertyType: ['Plots / Land', 'Residential'],
    assignedProjects: [],
    description: '',

    // 5. Bank Details
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      chequeDoc: ''
    },

    // 6. Commission Details
    commissionType: 'Percentage (%)',
    commissionRate: '2.5%',
    commissionApplicableOn: 'Total Property Value',
    commissionPaymentTerms: 'On Booking',
    specialCommissionNotes: '',

    // 7. Login & Account Details
    loginEmail: '',
    username: '',
    password: '',
    confirmPassword: '',
    accountStatus: 'Pending Verification',

    // 8. Additional Information
    referredBy: '',
    joiningDate: new Date().toISOString().split('T')[0],
    internalRemarks: '',
    agreementDoc: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [docPreviewModal, setDocPreviewModal] = useState({ open: false, title: '', url: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        ...defaultForm,
        ...agent,
        password: agent.password || '',
        confirmPassword: agent.password || '',
        bankDetails: {
          ...defaultForm.bankDetails,
          ...(agent.bankDetails || {})
        },
        preferredPropertyType: Array.isArray(agent.preferredPropertyType)
          ? agent.preferredPropertyType
          : ['Plots / Land', 'Residential']
      });
    } else {
      setFormData(defaultForm);
    }
    setActiveTab(1);
    setErrors({});
  }, [agent, isOpen]);

  // Tab-specific validity checks
  const isTab1Valid = () => {
    if (!formData.fullName?.trim() || !formData.agentType) return false;
    if (!isManager && !formData.branchId) return false;
    return true;
  };

  const isTab2Valid = () => {
    return (
      isValidPhone(formData.phone) &&
      isValidEmail(formData.email) &&
      !!formData.city?.trim() &&
      !!formData.state?.trim()
    );
  };

  const isTab7Valid = () => {
    if (isCreate) {
      return (
        isValidEmail(formData.loginEmail || formData.email) &&
        !!formData.password &&
        formData.password.length >= 6 &&
        formData.password === formData.confirmPassword
      );
    }
    return isValidEmail(formData.loginEmail || formData.email);
  };

  // Check if current tab is ready to go to next
  const canGoNext = () => {
    if (activeTab === 1) return isTab1Valid();
    if (activeTab === 2) return isTab2Valid();
    if (activeTab === 7) return isTab7Valid();
    return true;
  };

  // Entire form valid for final submission
  const isFormValid = () => {
    return isTab1Valid() && isTab2Valid() && isTab7Valid();
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) errs.fullName = 'Agent Full Name is required';
    if (!isManager && !formData.branchId) errs.branchId = 'Branch assignment is required';
    if (!isValidPhone(formData.phone)) errs.phone = 'Valid 10-digit mobile number required';
    if (!isValidEmail(formData.email)) errs.email = 'Valid email address required (e.g. name@domain.com)';
    if (!formData.city?.trim()) errs.city = 'City is required';
    if (!formData.state?.trim()) errs.state = 'State is required';

    if (isCreate) {
      if (!formData.password || formData.password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please complete mandatory fields marked with *');
      return;
    }
    onSave(formData);
  };

  const handlePropertyTypeToggle = (type) => {
    const current = formData.preferredPropertyType || [];
    if (current.includes(type)) {
      setFormData({ ...formData, preferredPropertyType: current.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, preferredPropertyType: [...current, type] });
    }
  };

  const openDocPreview = (title, url) => {
    if (!url) {
      toast.info(`No document uploaded for ${title}`);
      return;
    }
    setDocPreviewModal({ open: true, title, url });
  };

  const tabs = [
    { id: 1, name: '1. Basic Info', icon: HiOutlineUser },
    { id: 2, name: '2. Contact', icon: HiOutlinePhone },
    { id: 3, name: '3. Identity & KYC', icon: HiOutlineShieldCheck },
    { id: 4, name: '4. Professional', icon: HiOutlineBriefcase },
    { id: 5, name: '5. Bank Details', icon: HiOutlineCash },
    { id: 6, name: '6. Commission', icon: HiOutlineDocumentText },
    { id: 7, name: '7. Login & Access', icon: HiOutlineKey },
    { id: 8, name: '8. Additional', icon: HiOutlineDocumentText }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg text-[#D6A84B] font-black border border-white/20">
              <HiOutlineUserGroup className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  {isView
                    ? `Broker Dossier: ${formData.fullName}`
                    : isEdit
                    ? `Edit Channel Partner: ${formData.fullName}`
                    : 'Add New Agent / Broker (8-Step Dossier)'}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-[#D6A84B]">
                  {formData.agentCode}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    formData.accountStatus === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : formData.accountStatus === 'Rejected'
                      ? 'bg-red-500/20 text-red-300 border border-red-400/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  ● {formData.accountStatus || 'Pending Verification'}
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                KYC verification, documents preview, commission terms & login access management
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
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-gray-700">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agent Full Name *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Mishra"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.fullName ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agent Type *</label>
                  <select
                    disabled={isView}
                    value={formData.agentType}
                    onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Individual">Individual Channel Partner</option>
                    <option value="Agency">Real Estate Brokerage / Agency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Agency Name</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    placeholder="e.g. Prime Land Realtors"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    disabled={isView}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agent Code (Auto Generated)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.agentCode}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-xl font-mono font-bold text-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Broker / Channel Partner"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              {/* Branch Assignment Section */}
              {!isManager && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                  <label className="block font-black text-xs text-[#102A2E] mb-1">
                    Assign to Branch * <span className="text-[10px] text-[#0F766E] font-bold">(Mandatory for Company Admin)</span>
                  </label>
                  <select
                    disabled={isView}
                    value={formData.branchId || ''}
                    onChange={(e) => {
                      const selBranch = branches.find(b => (b._id || b.id) === e.target.value);
                      setFormData({
                        ...formData,
                        branchId: e.target.value,
                        branchName: selBranch ? selBranch.name : ''
                      });
                      if (errors.branchId) setErrors({ ...errors, branchId: null });
                    }}
                    className={`w-full px-3 py-2 text-xs border rounded-xl outline-none font-bold bg-white ${
                      errors.branchId ? 'border-red-500 ring-2 ring-red-100' : 'border-emerald-300 focus:border-[#0F766E]'
                    }`}
                  >
                    <option value="">-- Select Company Branch to Assign --</option>
                    {branches.map((b) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name} ({b.city || 'HQ'}) • Code: {b.branchCode || 'BR'}
                      </option>
                    ))}
                  </select>
                  {errors.branchId ? (
                    <p className="text-red-500 text-[10px] font-bold mt-1">{errors.branchId}</p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Company Admin cannot add a broker without assigning them to an active branch.
                    </p>
                  )}
                </div>
              )}

              <div>
                <FilePicker
                  label="Profile Photo (Upload or URL)"
                  value={formData.profilePhoto}
                  onChange={(url) => setFormData({ ...formData, profilePhoto: url })}
                  category="images"
                  accept="image/*"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT INFORMATION */}
          {activeTab === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Number (Primary) *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Alternate Mobile Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="+91 91234 56789"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    disabled={isView}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value, loginEmail: e.target.value })}
                    placeholder="broker@agency.com"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.email ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Office / Correspondence Address</label>
                <textarea
                  rows="2"
                  disabled={isView}
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="Plot 14, Commercial Complex, Hazratganj"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lucknow"
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
                    placeholder="Uttar Pradesh"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="226001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDENTITY & KYC DETAILS (WITH DOCUMENT PREVIEW) */}
          {activeTab === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800">
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    KYC Status: <b>{formData.kycStatus}</b>. Admin can preview uploaded documents below before approving login access.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="1234 5678 9012"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="09AAAAA0000A1Z5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono uppercase"
                  />
                </div>
              </div>

              {/* Document Uploads & Previews Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* PAN Card */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#102A2E]">PAN Card Document</span>
                    {formData.panCardDoc && (
                      <button
                        type="button"
                        onClick={() => openDocPreview('PAN Card', formData.panCardDoc)}
                        className="px-2.5 py-1 bg-[#0F766E] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                  </div>
                  <FilePicker
                    label="Upload PAN Card Document"
                    value={formData.panCardDoc}
                    onChange={(url) => setFormData({ ...formData, panCardDoc: url })}
                    category="documents"
                  />
                </div>

                {/* Aadhaar Card */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#102A2E]">Aadhaar Card Document</span>
                    {formData.aadhaarCardDoc && (
                      <button
                        type="button"
                        onClick={() => openDocPreview('Aadhaar Card', formData.aadhaarCardDoc)}
                        className="px-2.5 py-1 bg-[#0F766E] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                  </div>
                  <FilePicker
                    label="Upload Aadhaar Card Document"
                    value={formData.aadhaarCardDoc}
                    onChange={(url) => setFormData({ ...formData, aadhaarCardDoc: url })}
                    category="documents"
                  />
                </div>

                {/* Address Proof */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#102A2E]">Address Proof / Electricity Bill</span>
                    {formData.addressProofDoc && (
                      <button
                        type="button"
                        onClick={() => openDocPreview('Address Proof', formData.addressProofDoc)}
                        className="px-2.5 py-1 bg-[#0F766E] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                  </div>
                  <FilePicker
                    label="Upload Address Proof"
                    value={formData.addressProofDoc}
                    onChange={(url) => setFormData({ ...formData, addressProofDoc: url })}
                    category="documents"
                  />
                </div>

                {/* Identity Proof */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#102A2E]">Identity Proof / Passport / Voter ID</span>
                    {formData.identityProofDoc && (
                      <button
                        type="button"
                        onClick={() => openDocPreview('Identity Proof', formData.identityProofDoc)}
                        className="px-2.5 py-1 bg-[#0F766E] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                  </div>
                  <FilePicker
                    label="Upload Identity Proof"
                    value={formData.identityProofDoc}
                    onChange={(url) => setFormData({ ...formData, identityProofDoc: url })}
                    category="documents"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFESSIONAL INFORMATION */}
          {activeTab === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Experience in Real Estate</label>
                  <select
                    disabled={isView}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="0-1 Year">Fresher (0 - 1 Year)</option>
                    <option value="1-3 Years">1 - 3 Years</option>
                    <option value="3-5 Years">3 - 5 Years</option>
                    <option value="5-10 Years">5 - 10 Years</option>
                    <option value="10+ Years">Veteran (10+ Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Previous Company / Agency Associated</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.previousCompany}
                    onChange={(e) => setFormData({ ...formData, previousCompany: e.target.value })}
                    placeholder="e.g. Omaxe City Sales / Direct Freelance"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary Area of Operation</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.areaOfOperation}
                  onChange={(e) => setFormData({ ...formData, areaOfOperation: e.target.value })}
                  placeholder="e.g. Shaheed Path, Sultanpur Road, Gomti Nagar Extension"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Preferred Property Types</label>
                <div className="flex flex-wrap gap-2">
                  {['Residential', 'Commercial', 'Plots / Land', 'Industrial'].map((type) => {
                    const isChecked = (formData.preferredPropertyType || []).includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        disabled={isView}
                        onClick={() => handlePropertyTypeToggle(type)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#0F766E] text-white border-[#0F766E]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Agent Description & Background Notes</label>
                <textarea
                  rows="3"
                  disabled={isView}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specializes in high net-worth investors, local land acquisitions..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: BANK DETAILS */}
          {activeTab === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.bankDetails?.accountHolderName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value }
                      })
                    }
                    placeholder="Full name as in passbook"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.bankDetails?.bankName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                      })
                    }
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.bankDetails?.accountNumber || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                      })
                    }
                    placeholder="012345678901"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.bankDetails?.ifscCode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() }
                      })
                    }
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.bankDetails?.branchName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, branchName: e.target.value }
                      })
                    }
                    placeholder="Hazratganj Main Branch"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Cancelled Cheque / Bank Proof */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#102A2E]">Cancelled Cheque / Bank Passbook Proof</span>
                  {formData.bankDetails?.chequeDoc && (
                    <button
                      type="button"
                      onClick={() => openDocPreview('Cancelled Cheque', formData.bankDetails.chequeDoc)}
                      className="px-2.5 py-1 bg-[#0F766E] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                    >
                      <HiOutlineEye className="w-3.5 h-3.5" /> Preview Cheque
                    </button>
                  )}
                </div>
                <FilePicker
                  label="Upload Bank Document"
                  value={formData.bankDetails?.chequeDoc || ''}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, chequeDoc: url }
                    })
                  }
                  category="documents"
                />
              </div>
            </div>
          )}

          {/* TAB 6: COMMISSION DETAILS */}
          {activeTab === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commission Type</label>
                  <select
                    disabled={isView}
                    value={formData.commissionType}
                    onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Percentage (%)">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commission Rate / Percentage</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    placeholder="e.g. 2.5% or ₹50,000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-bold text-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commission Applicable On</label>
                  <select
                    disabled={isView}
                    value={formData.commissionApplicableOn}
                    onChange={(e) => setFormData({ ...formData, commissionApplicableOn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Total Property Value">Total Property Value</option>
                    <option value="Booking Amount">Booking / Token Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Settlement Terms</label>
                  <select
                    disabled={isView}
                    value={formData.commissionPaymentTerms}
                    onChange={(e) => setFormData({ ...formData, commissionPaymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="On Booking">On Booking Confirmation</option>
                    <option value="On Payment Collection">On Payment Collection Milestone</option>
                    <option value="On Full Payment">On Full Payment & Registry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Special Commission Notes / Tier Agreements</label>
                <textarea
                  rows="3"
                  disabled={isView}
                  value={formData.specialCommissionNotes}
                  onChange={(e) => setFormData({ ...formData, specialCommissionNotes: e.target.value })}
                  placeholder="Additional 0.5% incentive if 5 plots sold within quarter..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 7: LOGIN & ACCOUNT DETAILS */}
          {activeTab === 7 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-900">
                <span className="text-xs">
                  ℹ️ Agent can only log in after all submitted KYC documents are verified and Approved by Company Admin.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Login Email Address *</label>
                  <input
                    type="email"
                    disabled={isView}
                    value={formData.loginEmail || formData.email}
                    onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                    placeholder="agent.login@agency.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Username (Optional)</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="broker_sharma"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              {!isView && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Account Password {isCreate ? '*' : '(Leave empty if unchanged)'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        className={`w-full px-3 py-2 pr-10 border rounded-xl outline-none ${
                          errors.password ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Confirm Password {isCreate ? '*' : ''}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword || ''}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className={`w-full px-3 py-2 pr-10 border rounded-xl outline-none ${
                          errors.confirmPassword ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Account Status</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-gray-700">{formData.accountStatus}</span>
                  <span className="text-[11px] text-gray-400">
                    Controlled via KYC Document Review Verification
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ADDITIONAL INFORMATION & AGREEMENT */}
          {activeTab === 8 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Referred By (Staff / Broker Name)</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.referredBy}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                    placeholder="e.g. Anand Mishra (Sales Manager)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Onboarding / Joining Date</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Internal Admin Remarks</label>
                <textarea
                  rows="2"
                  disabled={isView}
                  value={formData.internalRemarks}
                  onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
                  placeholder="Direct authorization by Director..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              {/* Agreement Document */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#102A2E]">Channel Partner Agreement / MOU (Signed PDF)</span>
                  {formData.agreementDoc && (
                    <button
                      type="button"
                      onClick={() => openDocPreview('Signed Agreement', formData.agreementDoc)}
                      className="px-2.5 py-1 bg-[#0F766E] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-[#102A2E] cursor-pointer"
                    >
                      <HiOutlineEye className="w-3.5 h-3.5" /> Preview Agreement
                    </button>
                  )}
                </div>
                <FilePicker
                  label="Upload Channel Partner Agreement"
                  value={formData.agreementDoc}
                  onChange={(url) => setFormData({ ...formData, agreementDoc: url })}
                  category="documents"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
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
            {activeTab < 8 && (
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
            {/* If viewed and pending, allow Admin to Approve / Reject KYC on the spot */}
            {isView && formData.accountStatus === 'Pending Verification' && onApproveReject && (
              <>
                <button
                  type="button"
                  onClick={() => onApproveReject(formData.id || formData._id, 'reject')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Reject KYC
                </button>
                <button
                  type="button"
                  onClick={() => onApproveReject(formData.id || formData._id, 'approve')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  Approve Documents & Activate Login
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              {isView ? 'Close Dossier' : 'Cancel'}
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
                <span>{isEdit ? 'Save Dossier Changes' : 'Submit & Register Agent'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {docPreviewModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
            <div className="p-4 bg-[#102A2E] text-white flex items-center justify-between">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <HiOutlineDocumentText className="w-4 h-4 text-[#D6A84B]" />
                <span>Preview: {docPreviewModal.title}</span>
              </h4>
              <button
                onClick={() => setDocPreviewModal({ open: false, title: '', url: '' })}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-50">
              {docPreviewModal.url?.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
              docPreviewModal.url?.startsWith('data:image') ||
              docPreviewModal.url?.includes('images.unsplash.com') ? (
                <img
                  src={docPreviewModal.url}
                  alt={docPreviewModal.title}
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-md border border-gray-200"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-xs max-w-md">
                  <HiOutlineDocumentText className="w-16 h-16 text-[#0F766E] mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-800">{docPreviewModal.title}</p>
                  <p className="text-xs text-gray-400 mt-1 break-all">{docPreviewModal.url}</p>
                  <a
                    href={docPreviewModal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl hover:bg-[#102A2E] transition-all"
                  >
                    <HiOutlineDownload className="w-4 h-4" /> Open Full Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
