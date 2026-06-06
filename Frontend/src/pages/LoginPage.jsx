import { CheckCircleOutline, LocalShippingOutlined, EmailOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { setCredentials } from '../store/store.js';

const demoUsers = [
  'admin@vendorbridge.local',
  'procurement@vendorbridge.local',
  'vendor@vendorbridge.local',
  'manager@vendorbridge.local'
];

export default function LoginPage() {
  const { register, handleSubmit, setValue } = useForm({ defaultValues: { email: demoUsers[1], password: 'password' } });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');
      const { data } = await api.post('/api/auth/login', values);
      dispatch(setCredentials({ token: data.token, user: { name: data.name, email: data.email, role: data.role } }));
      navigate('/');
    } catch {
      setError('Login failed. Use one of the seeded accounts with password: password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f5f7f6]">
      {/* diagonal green split background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          clipPath: 'polygon(0 0, 66% 0, 34% 100%, 0% 100%)',
          background: 'linear-gradient(180deg,#0f4d35 0%, #114231 60%)'
        }}
      />

      <div className="pointer-events-none absolute -left-16 -top-16 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 w-80 h-80 bg-emerald-100/30 rounded-full blur-2xl" />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-[1.08fr,0.92fr] bg-white/90 backdrop-blur-sm rounded-[24px] border border-gray-100 shadow-[0_20px_60px_rgba(8,44,31,0.12)] overflow-hidden">
        {/* Left Branding Panel */}
        <div className="hidden md:flex flex-col p-10 lg:p-14 bg-[#103f2e] text-white relative">
          <div className="inline-grid place-items-center w-12 h-12 bg-green-50 text-green-800 rounded-lg mb-6">
            <LocalShippingOutlined fontSize="small" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">VendorBridge</h1>
          <p className="text-green-100/90 max-w-lg leading-relaxed mb-8">One procurement workspace for sourcing, approvals, purchase orders, invoices, and analytics.</p>

          <div className="mt-auto grid gap-3">
            {[
              { label: 'Compare vendor quotations', icon: <CheckCircleOutline className="text-green-300" fontSize="small" /> },
              { label: 'Keep approvals moving', icon: <CheckCircleOutline className="text-green-300" fontSize="small" /> },
              { label: 'Track spend and performance', icon: <CheckCircleOutline className="text-green-300" fontSize="small" /> }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-green-100">
                <div className="bg-green-900/30 rounded p-1.5">
                  {item.icon}
                </div>
                <div className="text-sm">{item.label}</div>
              </div>
            ))}
          </Box>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 3.5, md: 6 }, display: 'grid', alignContent: 'center', gap: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.025em' }}>Welcome back</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.7, fontSize: '.84rem' }}>Sign in to continue to your workspace.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" {...register('email', { required: true })} />
          <TextField label="Password" type="password" {...register('password', { required: true })} />
          <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 0.5 }}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <Typography color="text.secondary" sx={{ textAlign: 'center', fontSize: '.68rem', mt: 1 }}>Demo accounts</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
            {demoUsers.map((email) => (
              <Button key={email} variant="text" size="small" onClick={() => setValue('email', email)} sx={{ fontSize: '.67rem' }}>
                {email.split('@')[0]}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
          </div>

          <div className="absolute right-6 top-6 opacity-10">
            {/* Subtle procurement chart illustration (placeholder) */}
            <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="0" y="0" width="160" height="90" rx="8" fill="#ffffff" />
              <path d="M8 70 L30 40 L54 56 L78 20 L100 50 L132 30" stroke="#76c893" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-green-50 text-green-800 grid place-items-center">
                <LocalShippingOutlined />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">Welcome back</h2>
                <p className="text-sm text-gray-500">Sign in to continue to your workspace.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.58 9.92c.75 1.335-.213 2.981-1.742 2.981H4.419c-1.53 0-2.492-1.646-1.742-2.98l5.58-9.92zM9 7a1 1 0 012 0v3a1 1 0 11-2 0V7zm0 6a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <label className="text-sm text-gray-700">Email</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <EmailOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                aria-label="Email"
                {...register('email', { required: true })}
                className="flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="you@company.com"
              />
            </div>

            <label className="text-sm text-gray-700">Password</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <LockOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                aria-label="Password"
                {...register('password', { required: true })}
                type={showPassword ? 'text' : 'password'}
                className="flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition">
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            </div>

            <button type="submit" className="w-full mt-2 inline-flex items-center justify-center rounded-[12px] bg-[#176344] text-white py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-[#145032] active:translate-y-[1px] transition">
              Sign in
            </button>

            <div className="text-center text-xs text-gray-400">Demo accounts</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoUsers.map((email) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => { setValue('email', email); setValue('password', 'password'); }}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-sm bg-gray-50 hover:bg-gray-100 transition"
                >
                  {email.split('@')[0]}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
