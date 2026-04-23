import React, { useState } from 'react';
import styles from './Input.module.css';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  icon: Icon,
  error,
  isPassword,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        {Icon && (
          <div className={styles.iconLeft}>
            <Icon size={18} />
          </div>
        )}
        
        {type === 'select' && props.options ? (
          <select 
            className={`
              ${styles.input} 
              ${Icon ? styles.hasIconLeft : ''} 
              ${error ? styles.error : ''}
            `}
            {...props}
          >
            <option value="" disabled>{props.placeholder || 'Select an option'}</option>
            {props.options.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={inputType}
            className={`
              ${styles.input} 
              ${Icon ? styles.hasIconLeft : ''} 
              ${isPassword ? styles.hasIconRight : ''}
              ${error ? styles.error : ''}
            `}
            style={type === 'file' ? { padding: '0.675rem 1rem' } : undefined}
            {...props}
          />
        )}
        
        {isPassword && (
          <button
            type="button"
            className={styles.iconRight}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;
