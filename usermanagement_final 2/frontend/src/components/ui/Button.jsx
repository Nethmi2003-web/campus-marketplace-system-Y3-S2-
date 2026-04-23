import React from 'react';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  type = 'button',
  icon: Icon,
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'outlined': return styles.outlined;
      case 'ghost': return styles.ghost;
      default: return styles.primary;
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${styles.button} ${getVariantClass()} ${disabled || isLoading ? styles.disabled : ''}`}
      {...props}
    >
      {isLoading ? (
        <div className={styles.spinner} />
      ) : (
        <>
          {children}
          {Icon && <Icon size={18} />}
        </>
      )}
    </button>
  );
};

export default Button;
