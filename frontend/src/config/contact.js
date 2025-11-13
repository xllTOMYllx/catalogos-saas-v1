// Contact configuration for support and plan changes
export const CONTACT_CONFIG = {
  // WhatsApp number for plan change requests (include country code without +)
  // Example: 52 for Mexico, 1 for USA, 34 for Spain
  // Can be configured via environment variable or directly here
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '521234567890', // Replace with actual WhatsApp number
  
  // Support email (optional)
  supportEmail: 'soporte@catalogos-saas.com',
  
  // Support messages
  messages: {
    planChangeRequest: (planName, userName, userEmail) => 
      `Hola, me gustaría cambiar mi plan a *${planName}*.\n\n` +
      `*Nombre:* ${userName || 'No proporcionado'}\n` +
      `*Email:* ${userEmail}\n\n` +
      `¿Me pueden ayudar con el cambio de plan?`,
  },
};

/**
 * Generate WhatsApp URL with pre-filled message
 * @param {string} message - The message to send
 * @returns {string} WhatsApp URL
 */
export const getWhatsAppURL = (message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodedMessage}`;
};
