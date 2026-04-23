import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail } from 'lucide-react';
import styles from '../styles/Form.module.css';
import { resetPassword } from '../services/authService';
import { validatePasswordStrength } from '../utils/validators';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.otp || formData.otp.length < 6) newErrors.otp = 'Enter the 6-digit reset code';
    
    newErrors.password = validatePasswordStrength(formData.password);
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    Object.keys(newErrors).forEach(key => newErrors[key] === null && delete newErrors[key]);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await resetPassword(formData.email, formData.otp, formData.password);
      alert('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      setServerError(err.message || 'Failed to reset password. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Set New Password</h2>
          <p className={styles.subtitle}>
            Enter your reset code and choose a new password.
          </p>
        </div>

        {serverError && <div className={styles.errorBanner}>{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {!emailFromState && (
            <Input 
              label="Email Address"
              name="email"
              type="email"
              placeholder="your.email@my.sliit.lk"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              error={errors.email}
            />
          )}

          <Input 
            label="Reset Code (6 digits)"
            name="otp"
            placeholder="000000"
            value={formData.otp}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              setFormData(prev => ({ ...prev, otp: val }));
              if (errors.otp) setErrors(prev => ({ ...prev, otp: null }));
            }}
            error={errors.otp}
          />

          <Input 
            label="New Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            isPassword={true}
            error={errors.password}
          />
          
          <Input 
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={Lock}
            isPassword={true}
            error={errors.confirmPassword}
          />

          <Button type="submit" isLoading={isLoading} style={{ marginTop: '1rem' }}>
            Reset Password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
