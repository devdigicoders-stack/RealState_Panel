import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiShieldCheck,
  HiArrowRight,
  HiOutlineChartBar,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiSparkles
} from 'react-icons/hi';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Email or Mobile number is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors below', {
        position: 'top-right'
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      setIsLoading(false);

      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`, {
          position: 'top-right'
        });

        if (res.user.role === 'superadmin') {
          navigate('/superadmin/dashboard', { replace: true });
        } else {
          navigate(`/${res.user.role}/dashboard`, { replace: true });
        }
      } else {
        toast.error(res.message, {
          position: 'top-right'
        });
        Swal.fire({
          icon: res.isInactive ? 'warning' : 'error',
          title: res.isInactive ? 'Account Inactive' : 'Authentication Failed',
          text: res.message || 'Invalid email or password.',
          confirmButtonColor: '#0F766E'
        });
      }
    } catch (err) {
      setIsLoading(false);
      const isInactive = err.message?.includes('inactive') || err.message?.includes('Inactive');
      Swal.fire({
        icon: isInactive ? 'warning' : 'error',
        title: isInactive ? 'Account Inactive' : 'Authentication Failed',
        text: err.message || 'Login failed',
        confirmButtonColor: '#0F766E'
      });
      toast.error(err.message || 'Login failed');
    }
  };

  const handleSelectDemo = (demo) => {
    setIdentifier(demo.email);
    setPassword(demo.password);
    setErrors({});
    toast.info(`Selected: ${demo.badge}`, { autoClose: 1800 });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans bg-[#0B2023] relative overflow-hidden">

      {/* Clean Aesthetic Gradient Glows in Background */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-[#0F766E]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-[#D6A84B]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 bg-[#0F766E]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[1080px] bg-[#102A2E] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col lg:flex-row">

        {/* LEFT SECTION: Clean Brand Showcase */}
        <div className="lg:w-7/12 p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-gradient-to-br from-[#102A2E] via-[#0E3237] to-[#0A1F22] text-white">

          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#D6A84B_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Brand Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D6A84B] to-[#B58B35] flex items-center justify-center shadow-md shadow-[#D6A84B]/20">
              <svg className="w-6 h-6 text-[#102A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black tracking-tight text-white">RealEstate</span>
                <span className="text-xl font-black text-[#D6A84B]">Pro</span>
              </div>
              <p className="text-[10px] tracking-widest uppercase text-emerald-300 font-semibold mt-1">
                BUILD • SELL • GROW
              </p>
            </div>
          </div>

          {/* Center Content */}
          <div className="my-8 lg:my-10 relative z-10 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-[#F3C973] mb-3">
              <HiSparkles className="w-3.5 h-3.5 text-[#D6A84B]" /> Multi-Tenant Real Estate Platform
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Smarter Real Estate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-[#F3C973]">
                Business, Together
              </span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
              Manage Leads, Properties, Calling, Site Visits & Sales with Powerful Role-Based CRM Platform.
            </p>

            {/* 4 Feature Icon Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/10">
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E]/40 flex items-center justify-center text-[#F3C973] mb-1.5">
                  <HiOutlineChartBar className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">Track Growth</span>
              </div>

              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E]/40 flex items-center justify-center text-[#F3C973] mb-1.5">
                  <HiOutlinePhone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">Calling CRM</span>
              </div>

              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E]/40 flex items-center justify-center text-[#F3C973] mb-1.5">
                  <HiOutlineLocationMarker className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">Manage Plots</span>
              </div>

              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E]/40 flex items-center justify-center text-[#F3C973] mb-1.5">
                  <HiOutlineUserGroup className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-white leading-tight">Team Sync</span>
              </div>
            </div>
          </div>

          {/* Bottom Brand Line */}
          <div className="relative z-10 flex items-center justify-between text-xs pt-2">
            <span className="italic font-serif text-[#D6A84B]">
              "Your Property Business, Our Technology"
            </span>
            <span className="text-[11px] text-white/40 font-mono">v2.4</span>
          </div>

        </div>

        {/* RIGHT SECTION: Login Form */}
        <div className="lg:w-5/12 bg-white flex flex-col justify-between p-6 sm:p-8 lg:p-9 relative">

          <div className="w-full my-auto py-2">

            {/* House Logo in Gold */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-[#D6A84B]/15 flex items-center justify-center text-[#D6A84B]">
                <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#102A2E]">
                Welcome Back!
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Sign in to continue to your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* Email / Mobile */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <HiOutlineMail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors({ ...errors, identifier: null });
                    }}
                    placeholder="Enter email or mobile"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.identifier
                        ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-gray-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10'
                    }`}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-[10px] text-red-600 mt-0.5 font-medium">{errors.identifier}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <HiOutlineLockClosed className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    placeholder="Enter Password"
                    className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-gray-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-600 mt-0.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#0F766E] focus:ring-[#0F766E] border-gray-300"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      title: 'Reset Password',
                      input: 'email',
                      inputLabel: 'Enter registered email address',
                      inputPlaceholder: 'user@company.com',
                      confirmButtonText: 'Send Reset Link',
                      confirmButtonColor: '#0F766E',
                      showCancelButton: true
                    }).then((result) => {
                      if (result.isConfirmed && result.value) {
                        toast.success('Password reset link sent successfully!');
                      }
                    });
                  }}
                  className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#102A2E] text-white font-bold text-xs tracking-wide shadow-md shadow-[#0F766E]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <HiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

         

            {/* Bottom Security Assurance */}
            <div className="mt-4 text-center flex items-center justify-center gap-1 text-[11px] text-gray-400 font-medium">
              <HiShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Your data is safe with us</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

