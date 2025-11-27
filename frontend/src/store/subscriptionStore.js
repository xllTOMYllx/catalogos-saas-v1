import { create } from 'zustand';
import {
  getSubscriptionPlans,
  getUserSubscription,
  getUserLimits,
  getProductLimits,
  changePlan,
  cancelSubscription,
} from '../api/subscriptions';

const useSubscriptionStore = create((set, get) => ({
  plans: [],
  currentSubscription: null,
  limits: null,
  productLimits: {},
  loading: false,
  error: null,

  // Fetch all available plans
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await getSubscriptionPlans();
      set({ plans, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch current user's subscription
  fetchUserSubscription: async (userId) => {
    set({ loading: true, error: null });
    try {
      const subscription = await getUserSubscription(userId);
      set({ currentSubscription: subscription, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false, currentSubscription: null });
    }
  },

  // Fetch user limits
  fetchUserLimits: async (userId) => {
    try {
      const limits = await getUserLimits(userId);
      set({ limits });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch product limits for a specific catalog
  fetchProductLimits: async (userId, catalogId) => {
    try {
      const productLimits = await getProductLimits(userId, catalogId);
      set((state) => ({
        productLimits: {
          ...state.productLimits,
          [catalogId]: productLimits,
        },
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Refresh all subscription data for a user (useful after plan changes)
  refreshAllSubscriptionData: async (userId, catalogId = null) => {
    try {
      // Reset limits and product limits to force fresh fetch
      set({ limits: null, productLimits: {} });
      
      // Fetch all data in parallel
      const promises = [
        get().fetchUserSubscription(userId),
        get().fetchUserLimits(userId),
      ];
      
      if (catalogId) {
        promises.push(get().fetchProductLimits(userId, catalogId));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
    }
  },

  // Change user's plan
  changePlan: async (userId, planId) => {
    set({ loading: true, error: null });
    try {
      const subscription = await changePlan(userId, planId);
      set({ currentSubscription: subscription, loading: false });
      // Refresh limits after changing plan
      get().fetchUserLimits(userId);
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Cancel user's subscription
  cancelSubscription: async (userId) => {
    set({ loading: true, error: null });
    try {
      const subscription = await cancelSubscription(userId);
      set({ currentSubscription: subscription, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Check if user can perform action based on limits
  canCreateCatalog: () => {
    const { limits } = get();
    return limits?.canCreateCatalog ?? true;
  },

  canAddProduct: (catalogId) => {
    const { productLimits } = get();
    if (!catalogId) {
      return true;
    }
    return productLimits[catalogId]?.canAdd ?? true;
  },

  // Reset store
  reset: () => {
    set({
      plans: [],
      currentSubscription: null,
      limits: null,
      productLimits: {},
      loading: false,
      error: null,
    });
  },
}));

export default useSubscriptionStore;
