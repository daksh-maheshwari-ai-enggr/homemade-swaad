import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useVerifyOTPMutation, useSendOTPMutation } from '../../store/store';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';

interface OtpPageProps {
  mode?: 'login' | 'register' | 'password-reset';
}

/** Pull a readable message out of an RTK Query error. */
function errorMessage(error: unknown, fallback: string): string {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message || data?.error || fallback;
}

export function OtpPage({ mode = 'login' }: OtpPageProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [verifyOtp] = useVerifyOTPMutation();
  const [sendOtp] = useSendOTPMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state if available
  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state?.email) {
      setEmail(state.email);
      setStep('verify');
    }
  }, [location]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      await sendOtp({ email }).unwrap();
      setStep('verify');
      setStatus(`OTP sent to ${email}`);
    } catch (err) {
      setError(errorMessage(err, 'Failed to send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const result = await verifyOtp({ email, code: otp }).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.user }));
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Invalid or expired OTP'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Complete Registration' : 'Reset Password'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login'
              ? 'Enter the OTP sent to your email'
              : mode === 'register'
                ? 'Verify your email to complete registration'
                : 'Enter the OTP to reset your password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {status && !error && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {status}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="otp-page-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="otp-page-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-center text-2xl tracking-wider"
                placeholder="6 digits"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => handleSendOtp({ preventDefault() {} } as React.FormEvent)}
              disabled={loading}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to={mode === 'login' ? '/login' : mode === 'register' ? '/register' : '/forgot-password'}
            className="text-sm text-primary hover:underline font-medium"
          >
            Back to {mode === 'login' ? 'Login' : mode === 'register' ? 'Registration' : 'Forgot Password'}
          </Link>
        </div>
      </div>
    </div>
  );
}
