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
  const [etherealUrl, setEtherealUrl] = useState(null);
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
    setEtherealUrl(null);
    try {
      const data = await sendPasswordResetInfo(email);
      setSuccessMsg('Reset code has been generated.');
      
      if (data.previewUrl) {
        // Show explicit link block securely avoiding popup blockers
        setEtherealUrl(data.previewUrl);
      } else {
        setTimeout(() => navigate('/reset-password', { state: { email } }), 2500);
      }
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

        {etherealUrl ? (
          <div style={{ padding: '1.5rem', background: '#f5f3ff', border: '2px dashed #8b5cf6', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: '#6d28d9', fontSize: '1.2rem' }}>🧪 Presentation Link Generated</p>
            <p style={{ color: '#4c1d95', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.4' }}>
              Your browser blocked the pop-up. We safely intercepted the email for you to view manually:
            </p>
            <a href={etherealUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.8rem 1.5rem', background: '#8b5cf6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', marginBottom: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
              👉 Click Here to Open Graphical Email
            </a>
            <Button type="button" onClick={() => navigate('/reset-password', { state: { email } })} style={{ width: '100%' }}>
              Proceed to Password Reset
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
