import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  useVerifyOTPMutation, 
  useSendOTPMutation 
} from '../../store/store';

interface OtpPageProps {
  mode?: 'login' | 'register' | 'password-reset';
  email?: string;
  onSuccess?: () => void;
}

export function OtpPage({ 
  mode = 'login', 
  email: initialEmail = '',
  onSuccess 
}: OtpPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [verifyOtp] = useVerifyOTPMutation();
  const [resendOtp] = useSendOTPMutation();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state if available
  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
      setStep('verify');
    }
  }, [location]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await resendOtp({ email }).unwrap();
    if (result.success) {
      setStep('verify');
    } else {
      alert(result.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await verifyOtp({ email, code: otp }).unwrap();
      if (onSuccess) {
        onSuccess();
      } else {
        localStorage.setItem('token', result.token);
        navigate('/');
      }
    } catch (error) {
      alert('Invalid or expired OTP');
    }
  };

  const handleResend = async () => {
    await handleSendOtp({} as React.FormEvent);
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
                : 'Enter the OTP to reset your password'
            }
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-center text-2xl tracking-wider"
                placeholder="6 digits"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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