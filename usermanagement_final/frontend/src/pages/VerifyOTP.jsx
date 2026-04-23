import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { MailCheck } from 'lucide-react';
import styles from '../styles/Form.module.css';
import { verifyOTP, sendOTPRequest } from '../services/authService';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state (passed from Register page)
  const emailFromState = location.state?.email || '';
  
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('An OTP code has been sent to your university email.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (otp.length < 6) {
      setError('OTP must be at least 6 digits');
      return;
    }
    
    setIsLoading(true);
    try {
      await verifyOTP(email, otp);
      setSuccessMsg('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setError(null);
    try {
      await sendOTPRequest(email);
      setSuccessMsg('New OTP sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <AuthLayout>
      <div className={styles.formWrapper} style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
          <MailCheck size={48} />
        </div>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Verify Email</h2>
          <p className={styles.subtitle}>
             Enter the 6-digit code sent to your university email.
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {!emailFromState && (
            <Input 
              name="email"
              type="email"
              placeholder="your.email@my.sliit.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
            />
          )}
          
          <Input 
            name="otp"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            error={error ? ' ' : null}
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
          />

          <Button type="submit" isLoading={isLoading} style={{ marginTop: '1rem' }}>
            Verify Code
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            style={{ marginTop: '1rem' }}
            onClick={handleResendOtp}
          >
            Resend OTP
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
