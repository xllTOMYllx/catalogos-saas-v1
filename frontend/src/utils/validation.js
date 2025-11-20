/**
 * Validation utilities for form inputs
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates name (only letters, spaces, and accented characters)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid name
 */
export const validateName = (name) => {
  // Allow letters (including accented), spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  return nameRegex.test(name.trim());
};

/**
 * Validates phone number (allows various formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') return true; // Optional field
  // Allow numbers, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validates business name (alphanumeric and special chars commonly used in business names)
 * @param {string} businessName - Business name to validate
 * @returns {boolean} True if valid business name
 */
export const validateBusinessName = (businessName) => {
  // Allow letters, numbers, spaces, and common business symbols
  const businessNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,'&\-()]+$/;
  return businessNameRegex.test(businessName.trim());
};

/**
 * Get validation error message
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to validate
 * @param {string} type - Type of validation
 * @returns {string|null} Error message or null if valid
 */
export const getValidationError = (fieldName, value, type) => {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido.`;
  }

  switch (type) {
    case 'email':
      if (!validateEmail(value)) {
        return 'Por favor ingresa un email válido.';
      }
      break;
    case 'name':
      if (!validateName(value)) {
        return `${fieldName} solo debe contener letras y espacios.`;
      }
      break;
    case 'phone':
      if (!validatePhone(value)) {
        return 'Por favor ingresa un número de teléfono válido (mínimo 10 dígitos).';
      }
      break;
    case 'businessName':
      if (!validateBusinessName(value)) {
        return `${fieldName} contiene caracteres no permitidos.`;
      }
      break;
    default:
      break;
  }

  return null;
};
