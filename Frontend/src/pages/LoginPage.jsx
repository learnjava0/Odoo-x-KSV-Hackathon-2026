import {
  CheckCircleOutline,
  EmailOutlined,
  LocalShippingOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { setCredentials } from '../store/store.js';
import { getDefaultRoute } from '../config/access.js';

const demoUsers = [
  { email: 'admin@vendorbridge.com', password: 'admin123', label: 'Admin' },
  { email: 'manager@vendorbridge.com', password: 'manager123', label: 'Manager' },
  { email: 'procurement@vendorbridge.com', password: 'procurement123', label: 'Procurement' },
  { email: 'vendor@vendorbridge.com', password: 'vendor123', label: 'Vendor' }
];

export default function LoginPage() {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { email: demoUsers[2].email, password: demoUsers[2].password }
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');
      const { data } = await api.post('/auth/login', values);
      const name = data.email?.split('@')[0] || 'User';
      dispatch(setCredentials({
        token: data.token,
        user: { name, email: data.email, role: data.role }
      }));
      navigate(getDefaultRoute(data.role));
    } catch {
      setError('Login failed. Check the selected account and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectDemoUser = (account) => {
    setValue('email', account.email);
    setValue('password', account.password);
    setError('');
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
            One procurement workspace for sourcing, approvals, purchase orders, invoices, and analytics.
          </p>

          <div className="mt-auto grid gap-3">
            {['Compare vendor quotations', 'Keep approvals moving', 'Track spend and performance'].map((item) => (
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
              <LocalShippingOutlined />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to continue to your workspace.</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <label htmlFor="login-email" className="text-sm text-gray-700">Email</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <EmailOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                {...register('email', { required: true })}
                className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="you@company.com"
              />
            </div>

            <label htmlFor="login-password" className="text-sm text-gray-700">Password</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <LockOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                id="login-password"
                autoComplete="current-password"
                {...register('password', { required: true })}
                type={showPassword ? 'text' : 'password'}
                className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center rounded-[12px] bg-[#176344] text-white py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-[#145032] active:translate-y-[1px] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center text-xs text-gray-400">Demo accounts</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoUsers.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => selectDemoUser(account)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-sm bg-gray-50 hover:bg-gray-100 transition"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
