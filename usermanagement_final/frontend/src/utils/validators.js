// Regex for simple validation
const uniEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)*sliit\.lk$/;

export const validateUniversityEmail = (email) => {
  if (!email) return 'University email is required';
  if (!uniEmailRegex.test(email)) return 'Must be a valid @sliit.lk or @my.sliit.lk email';
  return null;
};

export const validatePasswordStrength = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  
  // Basic check for numbers and letters (as per screenshot)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) return 'Mix letters and numbers';
  return null;
};

// Generic required field
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
};

// Phone validation 
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!/^\+?[0-9\s\-]{9,15}$/.test(phone)) return 'Invalid phone number format';
  return null;
};

// Strict Student ID Validation (e.g. IT21000004)
export const validateStudentId = (id) => {
  if (!id || id.trim() === '') return 'Student ID is required';
  if (!/^[A-Za-z]{2}\d{8}$/.test(id.trim())) {
    return 'Must be 2 letters followed by 8 digits (e.g. IT21000004)';
  }
  return null;
};
