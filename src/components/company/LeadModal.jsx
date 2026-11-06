import React, { useState, useEffect } from 'react';
import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlineUpload,
  HiOutlinePaperClip,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { FilePicker } from '../common/FilePicker';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { companyAdminService } from '../../services/companyAdminService';

export const LeadModal = ({ isOpen, onClose, onSave, lead = null, mode = 'create' }) => {
  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const [activeTab, setActiveTab] = useState(1);

  const defaultForm = {
    // 1. Basic Information
    leadId: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    gender: 'Male',
    dob: '',

    // 2. Lead Source Details
    source: 'Website',
    campaignName: '',
    referenceName: '',
    agentId: '',
    agentName: '',
    referredByCustomerId: '',
    referredByCustomerName: '',
    referredByCustomerPhone: '',

    // 3. Property Requirements
    interestedIn: 'Plot / Land',
    projectName: 'Royal Palms Township',
    preferredLocation: '',
    propertySize: '1200 sqft',
    budgetFrom: '₹20 Lakh',
    budgetTo: '₹35 Lakh',
    preferredFacing: 'East Facing',
    purpose: 'Self Use',
    expectedPurchaseTimeline: 'Within 1 Month',

    // 4. Address Details
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    pinCode: '226001',
    completeAddress: '',

    // 5. Lead Assignment
    branchName: 'Head Office',
    managerName: 'Vikas Mehrotra (Sales Head)',
    assignedToName: 'Amit Kumar (Senior Sales)',
    priority: 'Warm',
    stage: 'New',

    // 6. Follow-up Details
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    followUpTime: '11:00 AM',
    followUpType: 'Phone Call',
    initialRemarks: '',
    additionalNotes: '',

    // 7. Additional Information
    leadAttachments: [],
    customerIdProofDoc: '',
    internalNotes: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [agentsList, setAgentsList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Load company-scoped customers and agents for referral binding
      companyAdminService.getCustomers().then(res => {
        if (res && res.data) setExistingCustomers(res.data);
      }).catch(() => {});

      companyAdminService.getAgents().then(res => {
        if (res && res.data) setAgentsList(res.data);
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (lead) {
      setFormData({
        ...defaultForm,
        ...lead
      });
    } else {
      setFormData(defaultForm);
    }
    setActiveTab(1);
    setErrors({});
  }, [lead, isOpen]);

  // Tab-specific validity checks
  const isTab1Valid = () => {
    return (
      !!formData.name?.trim() &&
      isValidPhone(formData.phone) &&
      (!formData.email || isValidEmail(formData.email))
    );
  };

  const isTab2Valid = () => {
    return !!formData.source;
  };

  const isTab3Valid = () => {
    return (
      !!formData.interestedIn &&
      !!formData.budgetFrom?.trim() &&
      !!formData.budgetTo?.trim()
    );
  };

  const isTab5Valid = () => {
    return !!formData.branchName?.trim() && !!formData.assignedToName?.trim();
  };

  const canGoNext = () => {
    if (activeTab === 1) return isTab1Valid();
    if (activeTab === 2) return isTab2Valid();
    if (activeTab === 3) return isTab3Valid();
    if (activeTab === 5) return isTab5Valid();
    return true;
  };

  const isFormValid = () => {
    return isTab1Valid() && isTab2Valid() && isTab3Valid() && isTab5Valid();
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Customer Full Name is required';
    if (!isValidPhone(formData.phone)) errs.phone = 'Valid 10-digit mobile number required';
    if (formData.email && !isValidEmail(formData.email)) errs.email = 'Valid email address required';
    if (!formData.source) errs.source = 'Lead source is required';
    if (!formData.interestedIn) errs.interestedIn = 'Property requirement type is required';
    if (!formData.budgetFrom) errs.budgetFrom = 'Budget From is required';
    if (!formData.budgetTo) errs.budgetTo = 'Budget To is required';
    if (!formData.branchName) errs.branchName = 'Branch assignment is required';
    if (!formData.assignedToName) errs.assignedToName = 'Sales Executive is required';

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
    { id: 1, name: '1. Basic Info', icon: HiOutlineUser },
    { id: 2, name: '2. Source', icon: HiOutlineBriefcase },
    { id: 3, name: '3. Requirements', icon: HiOutlineHome },
    { id: 4, name: '4. Address', icon: HiOutlineLocationMarker },
    { id: 5, name: '5. Assignment', icon: HiOutlineBriefcase },
    { id: 6, name: '6. Follow-up', icon: HiOutlineCalendar },
    { id: 7, name: '7. Docs & Notes', icon: HiOutlinePaperClip }
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
              <HiOutlineUser className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  {isView ? `Lead Dossier: ${formData.name}` : isEdit ? `Edit Lead: ${formData.name}` : 'Add New Customer Lead (7-Step Dossier)'}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-[#D6A84B]">
                  {formData.leadId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    formData.priority === 'Hot'
                      ? 'bg-red-500/20 text-red-300 border border-red-400/40'
                      : formData.priority === 'Warm'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  }`}
                >
                  ● {formData.priority} Priority
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Inquiry source tracking, property specifications, staff assignment & follow-up scheduler
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
                  <label className="block font-bold text-gray-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Verma"
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0F766E]'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead ID (Auto Generate)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.leadId}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-xl font-mono font-bold text-[#0F766E]"
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled={isView}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@gmail.com"
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
            </div>
          )}

          {/* TAB 2: LEAD SOURCE DETAILS */}
          {activeTab === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead Source *</label>
                  <select
                    disabled={isView}
                    value={formData.source}
                    onChange={(e) => {
                      const newSrc = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        source: newSrc,
                        ...(newSrc !== 'Referral' ? { referredByCustomerId: '', referredByCustomerName: '', referredByCustomerPhone: '' } : {})
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Website">Website</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Property Portal">Property Portal (99acres / Magicbricks)</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Walk-in">Walk-in Direct</option>
                    <option value="Referral">Customer Referral</option>
                    <option value="Agent / Broker">Agent / Broker Channel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Campaign Name (If ads / digital)</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.campaignName}
                    onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    placeholder="e.g. Diwali Villa Fest 2026"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* DYNAMIC CUSTOMER REFERRAL BINDING */}
              {formData.source === 'Referral' && (
                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E]">
                    <HiOutlineUserGroup className="w-4 h-4" />
                    <span>Customer Referral Network (Auto Agent Linkage)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Select Referring Customer *</label>
                      <select
                        disabled={isView}
                        value={formData.referredByCustomerId}
                        onChange={(e) => {
                          const refId = e.target.value;
                          const selectedCust = existingCustomers.find(c => String(c._id || c.id) === String(refId));
                          if (selectedCust) {
                            setFormData(prev => ({
                              ...prev,
                              referredByCustomerId: selectedCust._id || selectedCust.id,
                              referredByCustomerName: selectedCust.name,
                              referredByCustomerPhone: selectedCust.phone,
                              // Auto-inherit parent agent if customer was brought by an agent
                              ...(selectedCust.agentId ? {
                                agentId: selectedCust.agentId,
                                agentName: selectedCust.agentName || prev.agentName
                              } : {})
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              referredByCustomerId: '',
                              referredByCustomerName: '',
                              referredByCustomerPhone: ''
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-teal-300 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                      >
                        <option value="">-- Choose Existing Customer --</option>
                        {existingCustomers.map(c => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name} ({c.phone}) {c.agentName ? `• Agent: ${c.agentName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Assigned Parent Agent (Auto Credited)</label>
                      <select
                        disabled={isView}
                        value={formData.agentId}
                        onChange={(e) => {
                          const agId = e.target.value;
                          const selAg = agentsList.find(a => String(a._id || a.id) === String(agId));
                          setFormData(prev => ({
                            ...prev,
                            agentId: agId,
                            agentName: selAg ? selAg.fullName || selAg.agencyName : prev.agentName
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-semibold text-[#0F766E]"
                      >
                        <option value="">Direct Company (No Agent)</option>
                        {agentsList.map(a => (
                          <option key={a._id || a.id} value={a._id || a.id}>
                            {a.fullName || a.name || 'Agent'} ({a.agentCode || 'CP'}) - Comm: {a.commissionPercentage || '2.0%'}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">
                        * Commission will only be credited to this Agent when booking completes.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {formData.source !== 'Referral' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reference Name</label>
                    <input
                      type="text"
                      disabled={isView}
                      value={formData.referenceName}
                      onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                      placeholder="Referred by staff or walk-in..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Agent / Channel Partner</label>
                    <select
                      disabled={isView}
                      value={formData.agentId}
                      onChange={(e) => {
                        const agId = e.target.value;
                        const selAg = agentsList.find(a => String(a._id || a.id) === String(agId));
                        setFormData(prev => ({
                          ...prev,
                          agentId: agId,
                          agentName: selAg ? selAg.fullName || selAg.agencyName : ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                    >
                      <option value="">Direct Company (No Agent)</option>
                      {agentsList.map(a => (
                        <option key={a._id || a.id} value={a._id || a.id}>
                          {a.fullName || a.name || 'Agent'} ({a.agentCode || 'CP'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPERTY REQUIREMENTS */}
          {activeTab === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Interested In *</label>
                  <select
                    disabled={isView}
                    value={formData.interestedIn}
                    onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot / Land">Plot / Land</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment / Flat">Apartment / Flat</option>
                    <option value="Office Space">Office Space</option>
                    <option value="Shop">Commercial Shop</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Project</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g. Royal Palms Township"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Property Size</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.propertySize}
                    onChange={(e) => setFormData({ ...formData, propertySize: e.target.value })}
                    placeholder="e.g. 1200 - 1500 sqft"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Budget From *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.budgetFrom}
                    onChange={(e) => setFormData({ ...formData, budgetFrom: e.target.value })}
                    placeholder="e.g. ₹20 Lakh"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Budget To *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.budgetTo}
                    onChange={(e) => setFormData({ ...formData, budgetTo: e.target.value })}
                    placeholder="e.g. ₹35 Lakh"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preferred Facing</label>
                  <select
                    disabled={isView}
                    value={formData.preferredFacing}
                    onChange={(e) => setFormData({ ...formData, preferredFacing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="East Facing">East Facing</option>
                    <option value="North Facing">North Facing</option>
                    <option value="North-East Corner">North-East Corner</option>
                    <option value="West Facing">West Facing</option>
                    <option value="South Facing">South Facing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purpose of Purchase</label>
                  <select
                    disabled={isView}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Self Use">Self Use / Dream Home</option>
                    <option value="Investment">Investment & High ROI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Purchase Timeline</label>
                  <select
                    disabled={isView}
                    value={formData.expectedPurchaseTimeline}
                    onChange={(e) => setFormData({ ...formData, expectedPurchaseTimeline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Immediate">Immediate (Within 7 Days)</option>
                    <option value="Within 1 Month">Within 1 Month</option>
                    <option value="Within 3 Months">Within 3 Months</option>
                    <option value="Within 6 Months">Within 6 Months</option>
                    <option value="Just Exploring">Just Exploring / Long-term</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESS DETAILS */}
          {activeTab === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Complete Residential Address</label>
                <textarea
                  rows="3"
                  disabled={isView}
                  value={formData.completeAddress}
                  onChange={(e) => setFormData({ ...formData, completeAddress: e.target.value })}
                  placeholder="House 45, Aliganj Sector B..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: LEAD ASSIGNMENT */}
          {activeTab === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Branch *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="Head Office"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assign Manager</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="Sales Head Name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assign Sales Executive *</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.assignedToName}
                    onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                    placeholder="Executive Name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-bold text-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead Priority</label>
                  <select
                    disabled={isView}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Hot">🔥 Hot (Immediate intent)</option>
                    <option value="Warm">⚡ Warm (Good interest)</option>
                    <option value="Cold">❄️ Cold (Slow follow-up)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead Stage</label>
                  <select
                    disabled={isView}
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won (Booking Confirmed)</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FOLLOW-UP DETAILS */}
          {activeTab === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Follow-up Time</label>
                  <input
                    type="text"
                    disabled={isView}
                    value={formData.followUpTime}
                    onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
                    placeholder="11:30 AM"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Follow-up Type</label>
                  <select
                    disabled={isView}
                    value={formData.followUpType}
                    onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp Chat</option>
                    <option value="Meeting">Office Meeting</option>
                    <option value="Email">Email Communication</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Initial Discussion Remarks</label>
                <textarea
                  rows="2"
                  disabled={isView}
                  value={formData.initialRemarks}
                  onChange={(e) => setFormData({ ...formData, initialRemarks: e.target.value })}
                  placeholder="Spoke with client. Looking for corner plot near entrance..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  rows="2"
                  disabled={isView}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Requested township layout brochure on WhatsApp..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 7: ADDITIONAL INFORMATION & ID PROOFS */}
          {activeTab === 7 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <FilePicker
                label="Customer ID Proof (Aadhaar / PAN / Voter ID - Upload or URL)"
                value={formData.customerIdProofDoc}
                onChange={(url) => setFormData({ ...formData, customerIdProofDoc: url })}
                category="documents"
              />

              <div>
                <label className="block font-bold text-gray-700 mb-1">Internal Notes & Remarks</label>
                <textarea
                  rows="3"
                  disabled={isView}
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  placeholder="Confidential notes for management review only..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
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
            {activeTab < 7 && (
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
                <span>{isEdit ? 'Save Changes' : 'Register Customer Lead'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
