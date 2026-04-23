import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import styles from '../styles/Form.module.css';
import { loginUser } from '../services/authService';
import { validateRequired } from '../utils/validators';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Controls which view is shown on the left panel: 'idle' | 'typing' | 'error'
  const [leftView, setLeftView] = useState('idle');
  const typingTimeoutRef = React.useRef(null);
  const errorTimeoutRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Show marketplace SVG when user types
    setLeftView('typing');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setLeftView('idle');
    }, 2000);

    // Clear error for field on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    newErrors.email = validateRequired(formData.email, 'Email');
    newErrors.password = validateRequired(formData.password, 'Password');
    
    // Clean out nulls
    Object.keys(newErrors).forEach(key => newErrors[key] === null && delete newErrors[key]);
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Show the error SVG on the left
      setLeftView('error');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setLeftView('idle');
      }, 3000);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const result = await loginUser(formData.email, formData.password);
      
      // For this login module, everyone simply goes back to root (handled by other team members)
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Login failed');
      // Show error SVG on server failure too
      setLeftView('error');
      errorTimeoutRef.current = setTimeout(() => {
        setLeftView('idle');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout leftView={leftView}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>

        {serverError && <div className={styles.errorBanner}>{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input 
            label="University Email"
            name="email"
            type="email"
            placeholder="it21000000@my.sliit.lk"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            error={errors.email}
          />
          
          <Input 
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            isPassword={true}
            error={errors.password}
          />
          
          <Link to="/forgot-password" className={styles.forgotPassword}>
            Forgot Password?
          </Link>

          <Button type="submit" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
