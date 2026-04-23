import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Mail, Lock, CreditCard } from 'lucide-react';
import styles from '../styles/Form.module.css';
import { registerUser } from '../services/authService';
import { validateUniversityEmail, validatePasswordStrength, validateRequired, validatePhone, validateStudentId, validateAdminId } from '../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    faculty: '',
    phoneNo: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [regType, setRegType] = useState('Student');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Controls which view is shown on the left panel: 'idle' | 'typing' | 'error'
  const [leftView, setLeftView] = useState('idle');
  const typingTimeoutRef = React.useRef(null);
  const errorTimeoutRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setIdPhoto(files[0] || null);
      setErrors(prev => ({ ...prev, idPhoto: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Show marketplace SVG when user types
    setLeftView('typing');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setLeftView('idle');
    }, 2000);

    // Clear field-specific error
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    newErrors.fullName = validateRequired(formData.fullName, 'Full Name');
    if (regType === 'Admin') {
      newErrors.studentId = validateAdminId(formData.studentId);
    } else {
      newErrors.studentId = validateStudentId(formData.studentId);
    }
    
    newErrors.faculty = validateRequired(formData.faculty, 'Faculty');
    newErrors.phoneNo = validatePhone(formData.phoneNo);
    if (!idPhoto) {
      newErrors.idPhoto = regType === 'Admin' ? 'Admin ID Image is required' : 'Student ID Photo is required';
    }

    newErrors.email = validateUniversityEmail(formData.email);

    newErrors.password = validatePasswordStrength(formData.password);
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Strip nulls
    Object.keys(newErrors).forEach(key => newErrors[key] === null && delete newErrors[key]);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Show the error SVG on the left
      setLeftView('error');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // Auto-revert to idle after 3 seconds
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
      // Direct registration approach
      await registerUser(formData);
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout leftView={leftView}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        {/* --- ROLE TABS --- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
           <button
             type="button"
             onClick={() => { setRegType('Student'); setErrors(prev => ({...prev, studentId: null, idPhoto: null})); }}
             style={{
               flex: 1, padding: '10px', borderRadius: '8px', 
               border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold',
               backgroundColor: regType === 'Student' ? '#1e293b' : '#f8fafc',
               color: regType === 'Student' ? '#fff' : '#64748b',
               transition: 'all 0.2s ease'
             }}
           >
             Register as Student
           </button>
           <button
             type="button"
             onClick={() => { setRegType('Admin'); setErrors(prev => ({...prev, studentId: null, idPhoto: null})); }}
             style={{
               flex: 1, padding: '10px', borderRadius: '8px', 
               border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold',
               backgroundColor: regType === 'Admin' ? '#1e293b' : '#f8fafc',
               color: regType === 'Admin' ? '#fff' : '#64748b',
               transition: 'all 0.2s ease'
             }}
           >
             Register as Admin
           </button>
        </div>

        {serverError && <div className={styles.errorBanner}>{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className={styles.row}>
            <Input
              label="Full Name"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
            <Input
              label={regType === 'Admin' ? "Admin ID" : "Student ID"}
              name="studentId"
              placeholder={regType === 'Admin' ? "AD12345678" : "IT21000000"}
              value={formData.studentId}
              onChange={handleChange}
              error={errors.studentId}
            />
          </div>

          {/* Row 2 */}
          <div className={styles.row}>
            <Input
              label="Faculty"
              name="faculty"
              type="select"
              options={['Computing', 'Business', 'Engineering', 'Humanities & Sciences', 'Architecture']}
              placeholder="Select Faculty"
              value={formData.faculty}
              onChange={handleChange}
              error={errors.faculty}
            />
            <Input
              label="Phone Number"
              name="phoneNo"
              placeholder="+94 77 123 4567"
              value={formData.phoneNo}
              onChange={handleChange}
              error={errors.phoneNo}
            />
          </div>

          <Input
            label={regType === 'Admin' ? "Admin ID Image" : "Student ID Photo"}
            name="idPhoto"
            type="file"
            accept="image/*"
            onChange={handleChange}
            error={errors.idPhoto}
          />

          <Input
            label="University Email"
            name="email"
            type="email"
            placeholder="it21000000@my.sliit.lk"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
          />

          {/* Row 4 */}
          <div className={styles.row}>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
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
              isPassword={true}
              error={errors.confirmPassword}
            />
          </div>

          <Button type="submit" isLoading={isLoading} style={{ marginTop: '1rem' }}>
            Create Account
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
