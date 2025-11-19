/**
 * Utility functions for handling subscription limit errors
 */

/**
 * Check if an error is a subscription limit error
 * @param {Error|object} error - The error object
 * @returns {boolean} True if it's a subscription limit error
 */
export const isSubscriptionLimitError = (error) => {
  const message = error?.response?.data?.message || error?.message || '';
  return message.includes('límite') || 
         message.includes('limite') || 
         message.includes('Actualiza tu plan') ||
         message.includes('alcanzado');
};

/**
 * Extract the subscription limit error message
 * @param {Error|object} error - The error object
 * @returns {string} The error message
 */
export const getSubscriptionLimitMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Error desconocido';
};

/**
 * Create a user-friendly error object with upgrade suggestion
 * @param {Error|object} error - The error object
 * @returns {object} Object with title, message, and showUpgrade flag
 */
export const parseSubscriptionError = (error) => {
  const message = getSubscriptionLimitMessage(error);
  
  // Check if it's a catalog limit error
  if (message.includes('catálogo')) {
    return {
      title: 'Límite de Catálogos Alcanzado',
      message: message,
      showUpgrade: true,
      type: 'catalog'
    };
  }
  
  // Check if it's a product limit error
  if (message.includes('producto')) {
    return {
      title: 'Límite de Productos Alcanzado',
      message: message,
      showUpgrade: true,
      type: 'product'
    };
  }
  
  // Generic limit error
  return {
    title: 'Límite Alcanzado',
    message: message,
    showUpgrade: true,
    type: 'generic'
  };
};
