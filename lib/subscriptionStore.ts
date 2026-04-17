import { create } from "zustand";
import { subscriptionApi } from "./api/subscriptions";
import { mapBackendSubscription } from "./subscriptionMapper";
import dayjs from "dayjs";

interface SubscriptionStore {
  // Data
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;

  // Fetch & CRUD
  fetchSubscriptions: (token: string) => Promise<void>;
  createSubscription: (token: string, payload: CreateSubscriptionPayload) => Promise<void>;
  cancelSubscription: (token: string, id: string) => Promise<void>;
  deleteSubscription: (id: string) => void;
  addSubscription: (subscription: Subscription) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;

  // Selection & Bulk Operations
  selectionMode: boolean;
  selectedIds: string[];
  setSelectionMode: (value: boolean) => void;
  toggleSelectedId: (id: string) => void;
  clearSelection: () => void;
  deleteMultiple: (ids: string[]) => void;

  // Sorting
  sortBy: "name" | "price" | "date";
  sortByName: () => void;
  sortByPrice: () => void;
  sortByDate: () => void;

  // Filtering
  filterByStatus: "all" | "active" | "canceled";
  setFilterByStatus: (status: "all" | "active" | "canceled") => void;

  // Currency & Budget
  currency: "INR" | "EUR" | "USD";
  setCurrency: (currency: "INR" | "EUR" | "USD") => void;
  convertPrice: (price: number, fromCurrency: "INR" | "USD" | "EUR", toCurrency: "INR" | "USD" | "EUR") => number;
  getTotalMonthly: () => number;
  budget: number | null;
  setBudget: (amount: number | null) => void;
  overSpendingAlert: boolean;
  setOverSpendingAlert: (value: boolean) => void;
}

// Exchange rates (USD as base)
const EXCHANGE_RATES: Record<"INR" | "USD" | "EUR", number> = {
  USD: 1,
  EUR: 0.92,
  INR: 83.5,
};

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  // Initial state
  subscriptions: [],
  loading: false,
  error: null,
  selectionMode: false,
  selectedIds: [],
  sortBy: "date",
  filterByStatus: "all",
  currency: "INR",
  budget: null,
  overSpendingAlert: true,

  // ========== FETCH & CRUD ==========

  fetchSubscriptions: async (token: string) => {
    set({ loading: true, error: null });
    try {
      console.log("[store] fetchSubscriptions token?", Boolean(token));
      const response = await subscriptionApi.list(token);
      console.log("[store] fetchSubscriptions count:", response.data.length);
      const mappedSubscriptions = response.data.map(mapBackendSubscription);
      set({
        subscriptions: mappedSubscriptions,
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subscriptions";
      set({
        loading: false,
        error: errorMessage,
        subscriptions: [],
      });
    }
  },

  createSubscription: async (token: string, payload: CreateSubscriptionPayload) => {
    try {
      console.log("[store] createSubscription token?", Boolean(token));
      const response = await subscriptionApi.create(token, payload);
      console.log("[store] createSubscription response:", response.data);
      const newSubscription = mapBackendSubscription(response.data);

      set((state) => ({
        subscriptions: [
          newSubscription,
          ...state.subscriptions.filter(
            (subscription) =>
              (subscription.id || subscription._id) !==
              (newSubscription.id || newSubscription._id)
          ),
        ],
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create subscription";
      set({ error: errorMessage });
      throw err;
    }
  },

  cancelSubscription: async (token: string, id: string) => {
    try {
      console.log("[store] cancelSubscription token?", Boolean(token), "id:", id);
      const response = await subscriptionApi.cancel(token, id);
      const updatedSubscription = mapBackendSubscription(response.data);
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === id ? updatedSubscription : s
        ),
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel subscription";
      set({ error: errorMessage });
      throw err;
    }
  },

  deleteSubscription: (id: string) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s._id !== id && s.id !== id),
    }));
  },

  addSubscription: (subscription: Subscription) => {
    set((state) => ({
      subscriptions: [
        subscription,
        ...state.subscriptions.filter(
          (existingSubscription) =>
            (existingSubscription.id || existingSubscription._id) !==
            (subscription.id || subscription._id)
        ),
      ],
    }));
  },

  setSubscriptions: (subscriptions: Subscription[]) => {
    set({ subscriptions });
  },

  // ========== SELECTION & BULK OPERATIONS ==========

  setSelectionMode: (value: boolean) => {
    set({ selectionMode: value, selectedIds: value ? [] : [] });
  },

  toggleSelectedId: (id: string) => {
    set((state) => {
      const newSelectedIds = [...state.selectedIds];
      const index = newSelectedIds.indexOf(id);
      if (index > -1) {
        newSelectedIds.splice(index, 1);
      } else {
        newSelectedIds.push(id);
      }
      return { selectedIds: newSelectedIds };
    });
  },

  clearSelection: () => {
    set({ selectedIds: [], selectionMode: false });
  },

  deleteMultiple: (ids: string[]) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter(
        (s) => !ids.includes(s._id || s.id || "")
      ),
      selectedIds: [],
      selectionMode: false,
    }));
  },

  // ========== SORTING ==========

  sortByName: () => {
    set((state) => ({
      subscriptions: [...state.subscriptions].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
      sortBy: "name",
    }));
  },

  sortByPrice: () => {
    set((state) => {
      const { convertPrice } = get();
      const currency = state.currency;
      const sorted = [...state.subscriptions].sort((a, b) => {
        const priceA = convertPrice(a.price, a.currency, currency);
        const priceB = convertPrice(b.price, b.currency, currency);
        return priceA - priceB;
      });
      return { subscriptions: sorted, sortBy: "price" };
    });
  },

  sortByDate: () => {
    set((state) => ({
      subscriptions: [...state.subscriptions].sort((a, b) => {
        const dateA = dayjs(a.renewalDate);
        const dateB = dayjs(b.renewalDate);
        return dateA.diff(dateB);
      }),
      sortBy: "date",
    }));
  },

  // ========== FILTERING ==========

  setFilterByStatus: (status: "all" | "active" | "canceled") => {
    set({ filterByStatus: status });
  },

  // ========== CURRENCY & BUDGET ==========

  setCurrency: (currency: "INR" | "EUR" | "USD") => {
    set({ currency });
  },

  convertPrice: (
    price: number,
    fromCurrency: "INR" | "USD" | "EUR",
    toCurrency: "INR" | "USD" | "EUR"
  ): number => {
    if (fromCurrency === toCurrency) return price;

    // Convert to USD first, then to target currency
    const priceInUsd = price / EXCHANGE_RATES[fromCurrency];
    const priceInTarget = priceInUsd * EXCHANGE_RATES[toCurrency];

    return Number(priceInTarget.toFixed(2));
  },

  getTotalMonthly: () => {
    const { subscriptions, currency, convertPrice } = get();
    return subscriptions
      .filter((s) => s.status === "active")
      .reduce((total, sub) => {
        // Convert each subscription price to selected currency
        const convertedPrice = convertPrice(sub.price, sub.currency, currency);

        // For yearly/quarterly, convert to monthly
        const monthlyPrice = sub.billing === "yearly"
          ? convertedPrice / 12
          : sub.billing === "quarterly"
          ? convertedPrice / 3
          : convertedPrice;

        return total + monthlyPrice;
      }, 0);
  },

  setBudget: (amount: number | null) => {
    set({ budget: amount === null ? null : Number(amount) });
  },

  setOverSpendingAlert: (value: boolean) => {
    set({ overSpendingAlert: value });
  },
}));
