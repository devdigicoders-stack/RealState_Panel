import React, { useState, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlineUserGroup, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineMail, 
  HiOutlineKey, 
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineLockClosed,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import { FilePicker } from '../common/FilePicker';
import { toast } from 'react-toastify';

export const TeamModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  member = null, 
  mode = 'create',
  isManager = false,
  branches = [],
  managers = []
}) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [activeTab, setActiveTab] = useState(1);

  const defaultForm = {
    // 1. Personal Information
    fullName: '',
    profilePhoto: '',
    gender: 'Male',
    dob: '',
    fatherName: '',
    mobileNumber: '',
    alternatePhone: '',
    personalEmail: '',
    currentAddress: '',
    permanentAddress: '',

    // 2. Employment Information
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    designation: 'Sales Executive',
    department: 'Sales',
    branchId: '',
    branchName: '',
    reportingManager: '',
    reportingManagerId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full Time', // Full Time, Part Time, Contract, Internship
    workLocation: 'Office', // Office, Remote, Hybrid
    employmentStatus: 'Active', // Active, Probation, Inactive

    // 3. Professional Information
    previousCompany: '',
    previousDesignation: '',
    totalExperience: '1-3 Years',
    relevantExperience: '1-2 Years',
    skills: 'Lead Nurturing, Telecalling, Site Visit Hosting',
    previousSalary: '',

    // 4. Salary Information
    salaryType: 'Monthly',
    basicSalary: 25000,
    hra: 5000,
    allowances: 3000,
    incentives: '2% on Plot Booking',
    monthlyCtc: 33000,
    paymentMode: 'Bank Transfer',
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    },

    // 5. Identity & Documents
    aadhaarNumber: '',
    panNumber: '',
    aadhaarDoc: '',
    panCardDoc: '',
    resumeDoc: '',
    photoDoc: '',
    experienceLetterDoc: '',
    educationCertDoc: '',
    addressProofDoc: '',
    offerLetterDoc: '',
    joiningLetterDoc: '',

    // 6. Sales Permissions & Assignment
    assignedProjects: ['Royal Palm Township'],
    assignedTeam: 'Alpha Sales Team',
    leadAccess: 'Own', // Own / Team
    callingAccess: true,
    followUpAccess: true,
    siteVisitAccess: true,
    bookingAccess: true,
    customerAccess: true,

    // 7. Login Credentials
    loginEmail: '',
    username: '',
    password: 'password123',
    confirmPassword: 'password123',
    accountStatus: 'Active',

    // 8. Emergency Contact
    emergencyContact: {
      name: '',
      relationship: 'Parent / Spouse',
      phone: '',
      address: ''
    }
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        ...defaultForm,
        ...member,
        fullName: member.name || member.fullName || '',
        mobileNumber: member.phone || member.mobileNumber || '',
        loginEmail: member.email || member.loginEmail || '',
        bankDetails: { ...defaultForm.bankDetails, ...(member.bankDetails || {}) },
        emergencyContact: { ...defaultForm.emergencyContact, ...(member.emergencyContact || {}) }
      });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
    setActiveTab(1);
  }, [member, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) errs.fullName = 'Full Name is required';
    if (!isManager && !formData.branchId) errs.branchId = 'Branch assignment is required';
    if (!formData.loginEmail?.trim()) errs.loginEmail = 'Login Email is required';
    const rawPhone = (formData.mobileNumber || '').replace(/[^0-9]/g, '');
    if (!formData.mobileNumber?.trim() || rawPhone.length < 10) {
      errs.mobileNumber = 'Valid 10-digit mobile number required';
    }
    if (!isView && !isEdit && (!formData.password || formData.password.length < 6)) {
      errs.password = 'Password must be at least 6 characters';
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

  const tabs = [
    { id: 1, label: '1. Personal Info', icon: HiOutlineUser },
    { id: 2, label: '2. Employment', icon: HiOutlineBriefcase },
    { id: 3, label: '3. Professional', icon: HiOutlineUserGroup },
    { id: 4, label: '4. Salary & Bank', icon: HiOutlineCurrencyRupee },
    { id: 5, label: '5. KYC & Docs', icon: HiOutlineDocumentText },
    { id: 6, label: '6. Sales Permissions', icon: HiOutlineShieldCheck },
    { id: 7, label: '7. Login Credentials', icon: HiOutlineKey },
    { id: 8, label: '8. Emergency Contact', icon: HiOutlineExclamationCircle }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#102A2E] via-[#0E3A40] to-[#102A2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg text-emerald-300 font-black border border-white/20">
              <HiOutlineUserGroup className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  {formData.employeeId}
                </span>
                <h3 className="text-base font-extrabold tracking-tight">
                  {isView ? `Employee Dossier: ${formData.fullName}` : isEdit ? `Edit Staff: ${formData.fullName}` : 'Add Sales User & Employment Dossier'}
                </h3>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                {isManager 
                  ? 'Branch addition requires Manager document verification & Company Admin approval before login activation.' 
                  : 'Company Admin staff addition activates directly.'}
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
        <div className="flex border-b border-gray-200 bg-gray-50/75 overflow-x-auto px-3 shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`py-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-4">
          
          {/* TAB 1: Personal Information */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                  {errors.fullName && <p className="text-[10px] text-red-600 mt-0.5">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    disabled={isView}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father's full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                  {errors.mobileNumber && <p className="text-[10px] text-red-600 mt-0.5">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Alternate Mobile Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="Optional phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Personal Email</label>
                  <input
                    type="email"
                    disabled={isView}
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                    placeholder="personal@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Current Residential Address</label>
                  <textarea
                    rows={2}
                    disabled={isView}
                    value={formData.currentAddress}
                    onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                    placeholder="Flat / House, Sector, City, State, PIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Permanent Address</label>
                  <textarea
                    rows={2}
                    disabled={isView}
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    placeholder="Permanent home address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Profile Photo</label>
                {!isView ? (
                  <FilePicker
                    value={formData.profilePhoto}
                    onChange={(url) => setFormData({ ...formData, profilePhoto: url, photoDoc: url })}
                    label="Choose Profile Photo"
                  />
                ) : (
                  formData.profilePhoto && (
                    <img src={formData.profilePhoto} alt="Profile" className="w-16 h-16 rounded-xl object-cover border" />
                  )
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Employment Information */}
          {activeTab === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Employee ID (Auto-Generated)</label>
                <input
                  type="text"
                  disabled
                  value={formData.employeeId}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Designation *</label>
                <select
                  disabled={isView}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Telecaller</option>
                  <option>Sales Executive</option>
                  <option>Sr. Sales Executive</option>
                  <option>Site Executive / Relationship Mgr</option>
                  <option>Assistant Sales Manager</option>
                  <option>Sales Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  disabled
                  value="Sales & Marketing"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Assign Branch * {isManager ? '(Locked to Your Branch)' : '(Mandatory for Company Admin)'}
                </label>
                {isManager ? (
                  <input
                    type="text"
                    disabled
                    value={formData.branchName || 'Your Branch Office'}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl font-bold text-gray-700"
                  />
                ) : (
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
                    className={`w-full px-3 py-2 border rounded-xl outline-none font-bold text-xs ${
                      errors.branchId ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#0F766E]'
                    }`}
                  >
                    <option value="">-- Select Company Branch to Assign --</option>
                    {branches.map((b) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name} ({b.city || 'HQ'}) • Code: {b.branchCode || 'BR'}
                      </option>
                    ))}
                  </select>
                )}
                {errors.branchId && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.branchId}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Reporting Manager *</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                  placeholder="e.g. Branch Head / Sales Director"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Joining Date *</label>
                <input
                  type="date"
                  disabled={isView}
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Employment Type</label>
                <select
                  disabled={isView}
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Work Location</label>
                <select
                  disabled={isView}
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Office</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Employment Status</label>
                <select
                  disabled={isView}
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                >
                  <option>Active</option>
                  <option>Probation</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Professional Information */}
          {activeTab === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Previous Company</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.previousCompany}
                  onChange={(e) => setFormData({ ...formData, previousCompany: e.target.value })}
                  placeholder="e.g. DLF / Ansal Properties"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Previous Designation</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.previousDesignation}
                  onChange={(e) => setFormData({ ...formData, previousDesignation: e.target.value })}
                  placeholder="e.g. Associate Sales"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Total Experience</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.totalExperience}
                  onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                  placeholder="e.g. 3 Years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Relevant Real Estate Exp</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.relevantExperience}
                  onChange={(e) => setFormData({ ...formData, relevantExperience: e.target.value })}
                  placeholder="e.g. 2 Years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Previous Salary</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.previousSalary}
                  onChange={(e) => setFormData({ ...formData, previousSalary: e.target.value })}
                  placeholder="e.g. ₹25,000 / month"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Key Skills & Competencies</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Cold Calling, Negotiation, Site Visit Demonstrations, CRM Operations"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Salary Information & Bank */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Salary Type</label>
                  <select
                    disabled={isView}
                    value={formData.salaryType}
                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white"
                  >
                    <option>Monthly</option>
                    <option>Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Basic Salary (₹)</label>
                  <input
                    type="number"
                    disabled={isView}
                    value={formData.basicSalary}
                    onChange={(e) => {
                      const b = Number(e.target.value);
                      const ctc = b + Number(formData.hra || 0) + Number(formData.allowances || 0);
                      setFormData({ ...formData, basicSalary: b, monthlyCtc: ctc });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">HRA (₹)</label>
                  <input
                    type="number"
                    disabled={isView}
                    value={formData.hra}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      const ctc = Number(formData.basicSalary || 0) + h + Number(formData.allowances || 0);
                      setFormData({ ...formData, hra: h, monthlyCtc: ctc });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Special Allowances (₹)</label>
                  <input
                    type="number"
                    disabled={isView}
                    value={formData.allowances}
                    onChange={(e) => {
                      const a = Number(e.target.value);
                      const ctc = Number(formData.basicSalary || 0) + Number(formData.hra || 0) + a;
                      setFormData({ ...formData, allowances: a, monthlyCtc: ctc });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Monthly Gross CTC (₹)</label>
                  <input
                    type="number"
                    disabled
                    value={formData.monthlyCtc}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl font-black text-[#0F766E]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Incentive Structure</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.incentives}
                    onChange={(e) => setFormData({ ...formData, incentives: e.target.value })}
                    placeholder="e.g. ₹10,000 per closed plot deal or 1.5% commission"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    disabled={isView}
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white"
                  >
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Cash / UPI</option>
                  </select>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase text-[#0F766E] mb-3 flex items-center gap-1.5">
                  <HiOutlineCurrencyRupee className="w-4 h-4" /> Bank Account Details For Salary Payout
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      disabled={isView}
                      value={formData.bankDetails?.accountHolderName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value }
                      })}
                      placeholder="Name as in bank"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-xl bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      disabled={isView}
                      value={formData.bankDetails?.bankName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                      })}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-xl bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      disabled={isView}
                      value={formData.bankDetails?.accountNumber || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                      })}
                      placeholder="Account number"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-xl bg-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      disabled={isView}
                      value={formData.bankDetails?.ifscCode || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() }
                      })}
                      placeholder="HDFC0001234"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-xl bg-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Identity & Documents */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Aadhaar Card Number</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-gray-700 mb-2">Upload Verification Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">PAN Card Image/PDF</label>
                    {!isView ? (
                      <FilePicker
                        value={formData.panCardDoc}
                        onChange={(url) => setFormData({ ...formData, panCardDoc: url })}
                        label="Upload PAN Card"
                      />
                    ) : (
                      <div className="p-2 border rounded-xl bg-gray-50">{formData.panCardDoc ? 'Uploaded' : 'Not uploaded'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Aadhaar Card Document</label>
                    {!isView ? (
                      <FilePicker
                        value={formData.aadhaarDoc}
                        onChange={(url) => setFormData({ ...formData, aadhaarDoc: url })}
                        label="Upload Aadhaar"
                      />
                    ) : (
                      <div className="p-2 border rounded-xl bg-gray-50">{formData.aadhaarDoc ? 'Uploaded' : 'Not uploaded'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Resume / CV</label>
                    {!isView ? (
                      <FilePicker
                        value={formData.resumeDoc}
                        onChange={(url) => setFormData({ ...formData, resumeDoc: url })}
                        label="Upload Resume"
                      />
                    ) : (
                      <div className="p-2 border rounded-xl bg-gray-50">{formData.resumeDoc ? 'Uploaded' : 'Not uploaded'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Experience Letter</label>
                    {!isView ? (
                      <FilePicker
                        value={formData.experienceLetterDoc}
                        onChange={(url) => setFormData({ ...formData, experienceLetterDoc: url })}
                        label="Upload Experience Letter"
                      />
                    ) : (
                      <div className="p-2 border rounded-xl bg-gray-50">{formData.experienceLetterDoc ? 'Uploaded' : 'Not uploaded'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Education Certificate</label>
                    {!isView ? (
                      <FilePicker
                        value={formData.educationCertDoc}
                        onChange={(url) => setFormData({ ...formData, educationCertDoc: url })}
                        label="Upload Certificate"
                      />
                    ) : (
                      <div className="p-2 border rounded-xl bg-gray-50">{formData.educationCertDoc ? 'Uploaded' : 'Not uploaded'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">Offer / Joining Letter</label>
                    {!isView ? (
                      <FilePicker
                        value={formData.offerLetterDoc}
                        onChange={(url) => setFormData({ ...formData, offerLetterDoc: url })}
                        label="Upload Offer Letter"
                      />
                    ) : (
                      <div className="p-2 border rounded-xl bg-gray-50">{formData.offerLetterDoc ? 'Uploaded' : 'Not uploaded'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Sales Permissions & Assignment */}
          {activeTab === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Lead Access Level</label>
                  <select
                    disabled={isView}
                    value={formData.leadAccess}
                    onChange={(e) => setFormData({ ...formData, leadAccess: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none bg-white font-medium"
                  >
                    <option value="Own">Own Assigned Leads Only</option>
                    <option value="Team">Complete Team Leads</option>
                    <option value="Branch">All Branch Leads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Assigned Sales Team</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.assignedTeam}
                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                    placeholder="e.g. Inbound Calling Team / Site Closer Squad"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black uppercase text-[#102A2E] mb-3 flex items-center gap-1.5">
                  <HiOutlineShieldCheck className="w-4 h-4 text-[#0F766E]" /> Operational Permissions Matrix
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'callingAccess', label: 'CRM Calling & Dispositions' },
                    { key: 'followUpAccess', label: 'Follow-up Reminders & Schedule' },
                    { key: 'siteVisitAccess', label: 'Site Visit Booking & Feedback' },
                    { key: 'bookingAccess', label: 'Plot Hold & Booking Request' },
                    { key: 'customerAccess', label: 'Client Dossier Access' }
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={isView}
                        checked={formData[perm.key]}
                        onChange={(e) => setFormData({ ...formData, [perm.key]: e.target.checked })}
                        className="w-4 h-4 text-[#0F766E] rounded"
                      />
                      <span className="text-xs font-bold text-gray-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Login Credentials */}
          {activeTab === 7 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Official Login Email *</label>
                <input
                  type="email"
                  disabled={isView || isEdit}
                  value={formData.loginEmail}
                  onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                  placeholder="sales@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
                {errors.loginEmail && <p className="text-[10px] text-red-600 mt-0.5">{errors.loginEmail}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Username (Optional)</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="sales.rahul"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              {!isView && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Login Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                    />
                    {errors.password && <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <HiOutlineLockClosed className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  {isManager
                    ? 'Security Note: Once created by Branch, this sales user cannot log in until Branch verifies documents and Company Admin grants final approval.'
                    : 'Security Note: As Company Admin, this sales user will be directly activated and can log in immediately with these credentials.'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 8: Emergency Contact */}
          {activeTab === 8 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                  })}
                  placeholder="Father / Spouse / Brother"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Emergency Mobile Number</label>
                <input
                  type="text"
                  disabled={isView}
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Emergency Contact Address</label>
                <textarea
                  rows={2}
                  disabled={isView}
                  value={formData.emergencyContact?.address || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, address: e.target.value }
                  })}
                  placeholder="Address of emergency contact person"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-[#0F766E] outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between shrink-0">
            <div className="text-[11px] text-gray-400">
              Tab {activeTab} of {tabs.length}
            </div>

            <div className="flex items-center gap-2">
              {activeTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
              )}

              {activeTab < tabs.length && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-4 py-2 bg-[#102A2E] hover:bg-[#0F766E] text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Next Step
                </button>
              )}

              {!isView && (
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                  <span>{isEdit ? 'Save Employee Dossier' : 'Save & Register Sales User'}</span>
                </button>
              )}

              {isView && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-[#102A2E] text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Dossier
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
