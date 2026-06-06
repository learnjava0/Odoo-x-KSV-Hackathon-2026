import { EmailOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { email: '' } });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');
      setMessage('');
      await api.post('/auth/forgot-password', null, { params: { email: values.email } });
      setMessage('If the email exists, a reset link has been sent. Check your inbox.');
    } catch (err) {
      setError('Unable to send reset instructions. Please try again later.');
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
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
          background: 'linear-gradient(180deg, #083a2d 5%, #0f4d35 70%)'
        }}
      />
      <div className="pointer-events-none absolute -left-16 -top-16 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 w-80 h-80 bg-slate-100/30 rounded-full blur-2xl" />

      <div className="w-full max-w-3xl relative z-10 bg-white/95 backdrop-blur-sm rounded-[24px] border border-gray-100 shadow-[0_20px_60px_rgba(8,44,31,0.16)] overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-green-50 text-green-800 grid place-items-center">
              <EmailOutlined />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Forgot your password?</h2>
              <p className="text-sm text-gray-500">Enter your email and we’ll send a reset link.</p>
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
            <label htmlFor="forgot-email" className="text-sm text-gray-700">Email address</label>
            <div className="flex items-center gap-2">
              <div className="p-3 bg-gray-50 rounded-[12px] border border-gray-100">
                <EmailOutlined fontSize="small" className="text-gray-400" />
              </div>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                {...register('email', { required: true })}
                className="min-w-0 flex-1 py-3 px-4 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-shadow text-sm"
                placeholder="you@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center rounded-[12px] bg-[#176344] text-white py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-[#145032] active:translate-y-[1px] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending instructions...' : 'Send reset link'}
            </button>

            <div className="text-center text-sm text-gray-500">
              Remembered your password? <Link to="/login" className="font-semibold text-[#176344]">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
