/**
 * Password strength calculator and utilities
 */

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {object} Strength score (0-4) and feedback
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: '', color: '' };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
    feedback.push('Mayúsculas y minúsculas');
  } else if (/[a-z]/.test(password) || /[A-Z]/.test(password)) {
    feedback.push('Agrega mayúsculas y minúsculas');
  }

  if (/\d/.test(password)) {
    score++;
    feedback.push('Contiene números');
  } else {
    feedback.push('Agrega números');
  }

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score++;
    feedback.push('Contiene símbolos');
  } else {
    feedback.push('Agrega símbolos especiales');
  }

  // Cap score at 4
  score = Math.min(score, 4);

  // Determine label and color
  let label = '';
  let color = '';
  
  if (score === 0) {
    label = '';
    color = '';
  } else if (score === 1) {
    label = 'Muy débil';
    color = 'bg-red-500';
  } else if (score === 2) {
    label = 'Débil';
    color = 'bg-orange-500';
  } else if (score === 3) {
    label = 'Buena';
    color = 'bg-yellow-500';
  } else if (score === 4) {
    label = 'Fuerte';
    color = 'bg-green-500';
  }

  return { score, label, color, feedback };
};

/**
 * Get password strength percentage
 * @param {number} score - Strength score (0-4)
 * @returns {number} Percentage (0-100)
 */
export const getPasswordStrengthPercentage = (score) => {
  return (score / 4) * 100;
};
