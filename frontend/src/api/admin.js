import api from './axios';

// Get all clients with details (subscriptions, status, etc.)
export const getAdminClients = async () => {
  const response = await api.get('/admin/clients');
  return response.data;
};

// Get dashboard statistics
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Get all subscription plans for admin
export const getAdminSubscriptionPlans = async () => {
  const response = await api.get('/admin/subscription-plans');
  return response.data;
};

// Toggle user active/inactive status
export const toggleUserStatus = async (userId) => {
  const response = await api.put(`/admin/clients/${userId}/toggle-status`);
  return response.data;
};

// Change user subscription plan
export const changeUserSubscription = async (userId, planId) => {
  const response = await api.put(`/admin/clients/${userId}/change-subscription`, {
    planId,
  });
  return response.data;
};
