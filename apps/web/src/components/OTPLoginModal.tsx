import { useState } from 'react';
import { useSendOTPMutation, useVerifyOTPMutation } from '../store/store';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

export function OTPLoginModal() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [sendOTP] = useSendOTPMutation();
  const [verifyOTP] = useVerifyOTPMutation();
  const dispatch = useDispatch();

  const handleSendOTP = async () => {
    try {
      await sendOTP({ phone }).unwrap();
      setShowOTP(true);
      alert('OTP sent!');
    } catch (error) {
      alert('Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await verifyOTP({ phone, code: otp }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      alert('Logged in!');
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-bold mb-4">
          {showOTP ? 'Enter OTP' : 'Login'}
        </h3>
        
        {!showOTP ? (
          <div>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <button
              onClick={handleSendOTP}
              className="w-full btn btn-primary"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              maxLength={6}
            />
            <button
              onClick={handleVerifyOTP}
              className="w-full btn btn-success"
            >
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}