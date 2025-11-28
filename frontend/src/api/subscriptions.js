import api from './axios';

// Subscription Plans APIs
export const getSubscriptionPlans = async () => {
  const response = await api.get('/subscription-plans');
  return response.data;
};

export const getSubscriptionPlan = async (id) => {
  const response = await api.get(`/subscription-plans/${id}`);
  return response.data;
};

// Subscriptions APIs
export const getSubscriptions = async () => {
  const response = await api.get('/subscriptions');
  return response.data;
};

export const getSubscription = async (id) => {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data;
};

export const getUserSubscription = async (userId) => {
  const response = await api.get(`/subscriptions/user/${userId}`);
  return response.data;
};

export const getUserLimits = async (userId) => {
  const response = await api.get(`/subscriptions/user/${userId}/limits`);
  return response.data;
};

export const getProductLimits = async (userId, catalogId) => {
  const response = await api.get(`/subscriptions/user/${userId}/catalog/${catalogId}/product-limits`);
  return response.data;
};

export const createSubscription = async (subscriptionData) => {
  const response = await api.post('/subscriptions', subscriptionData);
  return response.data;
};

export const updateSubscription = async (id, subscriptionData) => {
  const response = await api.put(`/subscriptions/${id}`, subscriptionData);
  return response.data;
};

export const changePlan = async (userId, planId) => {
  const response = await api.put(`/subscriptions/user/${userId}/change-plan`, {
    planId,
  });
  return response.data;
};

export const cancelSubscription = async (userId) => {
  const response = await api.put(`/subscriptions/user/${userId}/cancel`);
  return response.data;
};

export const deleteSubscription = async (id) => {
  const response = await api.delete(`/subscriptions/${id}`);
  return response.data;
};
