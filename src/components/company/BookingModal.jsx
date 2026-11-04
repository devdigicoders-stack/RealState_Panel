import React, { useState, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlineBookmark, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlinePrinter,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineTag
} from 'react-icons/hi';
import { toast } from 'react-toastify';

export const BookingModal = ({ isOpen, onClose, onSave, booking = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    project: 'Royal Palm Township',
    plotNo: '',
    totalPlotValue: '',
    tokenAmount: '',
    discountOffered: 'Nil',
    salesExec: 'Amit Kumar',
    bookingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Pending Owner Approval'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (booking && (mode === 'edit' || mode === 'view')) {
      setFormData({
        customer: booking.customer || '',
        phone: booking.phone || '',
        project: booking.project || 'Royal Palm Township',
        plotNo: booking.plotNo || '',
        totalPlotValue: booking.totalPlotValue || '',
        tokenAmount: booking.tokenAmount || '',
        discountOffered: booking.discountOffered || 'Nil',
        salesExec: booking.salesExec || 'Amit Kumar',
        bookingDate: booking.bookingDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: booking.status || 'Pending Owner Approval'
      });
    } else {
      setFormData({
        customer: '',
        phone: '',
        project: 'Royal Palm Township',
        plotNo: '',
        totalPlotValue: '₹30,00,000',
        tokenAmount: '₹51,000',
        discountOffered: 'Nil',
        salesExec: 'Amit Kumar',
        bookingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pending Owner Approval'
      });
    }
    setErrors({});
  }, [booking, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact number is required';
    } else if (!/^[0-9+ -]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Valid 10-digit mobile number required';
    }
    if (!formData.plotNo.trim()) newErrors.plotNo = 'Plot unit number is required';
    if (!formData.totalPlotValue.trim()) newErrors.totalPlotValue = 'Total plot value is required';
    if (!formData.tokenAmount.trim()) newErrors.tokenAmount = 'Token amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve the highlighted errors.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#102A2E] to-[#0F766E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <HiOutlineBookmark className="w-5 h-5 text-[#D6A84B]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {mode === 'view' ? 'Booking & Allotment Dossier' : mode === 'edit' ? 'Modify Booking Allotment' : 'Create Plot Booking / Token Allotment'}
              </h3>
              <p className="text-[11px] text-gray-300">
                {mode === 'view' ? `Allotment Record: ${booking?.id || ''}` : 'Manage buyer token deposit, discounts, and plot lock'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {mode === 'view' ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase block">Booking ID</span>
                  <span className="text-sm font-black text-[#102A2E]">{booking?.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase block">Allotment Date</span>
                  <span className="text-xs font-bold text-gray-700">{formData.bookingDate}</span>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    formData.status.includes('Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    formData.status.includes('Registry') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {formData.status}
                  </span>
                </div>
              </div>

              {/* Customer & Unit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E] uppercase">
                    <HiOutlineUser className="w-4 h-4" />
                    <span>Customer Details</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#102A2E]">{formData.customer}</div>
                  <div className="text-xs font-mono text-gray-600">{formData.phone}</div>
                  <div className="text-[11px] text-gray-500">Sales Executive: <strong className="text-gray-800">{formData.salesExec}</strong></div>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#B58B35] uppercase">
                    <HiOutlineOfficeBuilding className="w-4 h-4" />
                    <span>Selected Property Unit</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#102A2E]">{formData.plotNo}</div>
                  <div className="text-xs text-gray-600">{formData.project}</div>
                  <div className="text-[11px] text-gray-500">Inventory Status: <strong className="text-emerald-700">Locked for Buyer</strong></div>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Financial Allotment Summary</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Total Plot Value</div>
                    <div className="text-sm font-black text-gray-800 mt-1">{formData.totalPlotValue}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Token Received</div>
                    <div className="text-sm font-black text-emerald-700 mt-1">{formData.tokenAmount}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                    <div className="text-[10px] text-amber-600 font-bold uppercase">Discount Allowed</div>
                    <div className="text-sm font-black text-amber-700 mt-1">{formData.discountOffered}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="e.g. Sanjay Verma"
                    className={`w-full p-2.5 text-xs border rounded-xl focus:outline-none focus:border-[#0F766E] ${
                      errors.customer ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                  {errors.customer && <p className="text-[10px] text-red-500 mt-0.5">{errors.customer}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94140 33445"
                    className={`w-full p-2.5 text-xs font-mono border rounded-xl focus:outline-none focus:border-[#0F766E] ${
                      errors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Township Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  >
                    <option>Royal Palm Township</option>
                    <option>Greenview Heights Villa Enclave</option>
                    <option>Emerald Commercial Strip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Plot Unit Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.plotNo}
                    onChange={(e) => setFormData({ ...formData, plotNo: e.target.value })}
                    placeholder="e.g. Plot #B-14 (1200 sqft)"
                    className={`w-full p-2.5 text-xs border rounded-xl focus:outline-none focus:border-[#0F766E] ${
                      errors.plotNo ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                  {errors.plotNo && <p className="text-[10px] text-red-500 mt-0.5">{errors.plotNo}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Total Plot Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.totalPlotValue}
                    onChange={(e) => setFormData({ ...formData, totalPlotValue: e.target.value })}
                    placeholder="e.g. ₹29,40,000"
                    className={`w-full p-2.5 text-xs font-bold border rounded-xl focus:outline-none focus:border-[#0F766E] ${
                      errors.totalPlotValue ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Token Amount Paid <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tokenAmount}
                    onChange={(e) => setFormData({ ...formData, tokenAmount: e.target.value })}
                    placeholder="e.g. ₹51,000"
                    className={`w-full p-2.5 text-xs font-bold text-emerald-700 border rounded-xl focus:outline-none focus:border-[#0F766E] ${
                      errors.tokenAmount ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Discount Offered
                  </label>
                  <input
                    type="text"
                    value={formData.discountOffered}
                    onChange={(e) => setFormData({ ...formData, discountOffered: e.target.value })}
                    placeholder="e.g. ₹40,000"
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Assigned Sales Executive
                  </label>
                  <select
                    value={formData.salesExec}
                    onChange={(e) => setFormData({ ...formData, salesExec: e.target.value })}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  >
                    <option>Amit Kumar</option>
                    <option>Vikash Tiwari</option>
                    <option>Rajesh Sharma (Sales Head)</option>
                    <option>Manoj Patel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Approval / Allotment Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  >
                    <option>Pending Owner Approval</option>
                    <option>Approved & Token Confirmed</option>
                    <option>Registry Completed</option>
                    <option>Cancelled / Refunded</option>
                  </select>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {mode === 'view' ? 'Close' : 'Cancel'}
          </button>

          {mode !== 'view' && (
            <button
              type="submit"
              form="booking-form"
              className="px-5 py-2 bg-[#0F766E] hover:bg-[#102A2E] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {mode === 'edit' ? 'Update Allotment' : 'Confirm Plot Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

