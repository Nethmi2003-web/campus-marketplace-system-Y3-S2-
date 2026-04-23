import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail } from 'lucide-react';
import styles from '../styles/Form.module.css';
import { sendPasswordResetInfo } from '../services/authService';
import { validateUniversityEmail } from '../utils/validators';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    const emailErr = validateUniversityEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetInfo(email);
      setSuccessMsg('Reset code sent to your email.');
      // Navigate to reset password page with email in state
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2500);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Forgot Password?</h2>
          <p className={styles.subtitle}>
            Enter your university email and we'll send you a code to reset your password.
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input 
            label="University Email"
            name="email"
            type="email"
            placeholder="it21000000@my.sliit.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            error={error ? ' ' : null}
          />
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Button type="submit" isLoading={isLoading}>
              Send Reset Code
            </Button>
            
            <Link to="/login" style={{ width: '100%', textDecoration: 'none' }}>
              <Button type="button" variant="outlined">
                Back to Login
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
