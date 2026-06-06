import {
  CheckCircleOutline,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  AccountCircle,
  LocalShippingOutlined,
  FlagOutlined
} from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

const roles = [
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'PROCUREMENT_OFFICER', label: 'Procurement Officer' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' }
];

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', password: '', role: 'VENDOR', name: '', category: '', gstNumber: '', contactDetails: '' }
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const selectedRole = watch('role');

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');
      setMessage('');
      await api.post('/auth/signup', values);
      setMessage('Account created. You can now sign in. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError('Signup failed. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f5f7f6] p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(0 0, 66% 0, 34% 100%, 0% 100%)',
          background: 'linear-gradient(180deg, #0f4d35 0%, #114231 60%)'
        }}
      />
      <div className="pointer-events-none absolute -left-16 -top-16 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 w-80 h-80 bg-emerald-100/30 rounded-full blur-2xl" />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-[1.08fr,0.92fr] bg-white/95 backdrop-blur-sm rounded-[24px] border border-gray-100 shadow-[0_20px_60px_rgba(8,44,31,0.16)] overflow-hidden">
        <div className="hidden md:flex flex-col p-10 lg:p-14 bg-[#103f2e] text-white relative">
          <div className="inline-grid place-items-center w-12 h-12 bg-green-50 text-green-800 rounded-lg mb-6">
            <LocalShippingOutlined fontSize="small" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">VendorBridge</h1>
          <p className="text-green-100/90 max-w-lg leading-relaxed mb-8">
            Join the procurement platform to manage RFQs, quotations, approvals and invoices from a single workspace.
          </p>

          <div className="mt-auto grid gap-3">
            {['Keep vendors organized', 'Track approvals', 'Generate invoices quickly'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-green-100">
                <div className="bg-green-900/30 rounded p-1.5">
                  <CheckCircleOutline className="text-green-300" fontSize="small" />
                </div>
                <div className="text-sm">{item}</div>
              </div>
            ))}
          </div>

          <div className="absolute right-6 top-6 opacity-10" aria-hidden="true">
            <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="160" height="90" rx="8" fill="#ffffff" />
              <path d="M8 70 L30 40 L54 56 L78 20 L100 50 L132 30" stroke="#76c893" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-green-50 text-green-800 grid place-items-center">
              <AccountCircle />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Create your account</h2>
              <p className="text-sm text-gray-500">Register a new vendor or procurement identity for VendorBridge.</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div role="status" className="mb-4 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <label htmlFor="signup-email" className="text-sm text-gray-700">Email</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <EmailOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                {...register('email', { required: true })}
                className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="you@company.com"
              />
            </div>

            <label htmlFor="signup-password" className="text-sm text-gray-700">Password</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <LockOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                id="signup-password"
                autoComplete="new-password"
                {...register('password', { required: true, minLength: 6 })}
                type={showPassword ? 'text' : 'password'}
                className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition"
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            </div>

            <label htmlFor="signup-role" className="text-sm text-gray-700">Role</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <FlagOutlined fontSize="small" className="text-gray-400" />
              </div>
              <select
                id="signup-role"
                {...register('role', { required: true })}
                className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            {selectedRole === 'VENDOR' && (
              <>
                <label htmlFor="signup-name" className="text-sm text-gray-700">Vendor name</label>
                <div className="flex items-center gap-2">
                  <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                    <AccountCircle fontSize="small" className="text-gray-400" />
                  </div>
                  <input
                    id="signup-name"
                    {...register('name', { required: true })}
                    className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                    placeholder="Vendor company name"
                  />
                </div>

                <label htmlFor="signup-category" className="text-sm text-gray-700">Category</label>
                <input
                  id="signup-category"
                  {...register('category')}
                  className="py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                  placeholder="Office supplies, hardware, etc."
                />

                <label htmlFor="signup-gst" className="text-sm text-gray-700">GST number</label>
                <input
                  id="signup-gst"
                  {...register('gstNumber')}
                  className="py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                  placeholder="24ABCDE1234F1Z5"
                />

                <label htmlFor="signup-contact" className="text-sm text-gray-700">Contact details</label>
                <input
                  id="signup-contact"
                  {...register('contactDetails')}
                  className="py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                  placeholder="vendor@company.com"
                />
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center rounded-[12px] bg-[#176344] text-white py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-[#145032] active:translate-y-[1px] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-center text-sm text-gray-500">
              Already have an account? <Link to="/login" className="font-semibold text-[#176344]">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
