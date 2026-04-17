import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        _id?: string;
        icon: ImageSourcePropType | string;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status: "active" | "paused" | "cancelled";
        startDate?: string;
        price: number;
        currency: "USD" | "EUR" | "INR";
        billing?: "monthly" | "yearly" | "quarterly";
        renewalDate?: string;
        color?: string;
        merchant?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType | string;
        name: string;
        price: number;
        currency: "USD" | "EUR" | "INR";
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }

    interface CreateSubscriptionModalProps {
        visible: boolean;
        onClose: () => void;
        onSubmit?: (payload: CreateSubscriptionPayload) => Promise<void>;
    }

    interface CreateSubscriptionPayload {
        name: string;
        price: number;
        frequency: "monthly" | "quarterly" | "yearly";
        category: string;
        icon?: string | ImageSourcePropType;
        currency: "USD" | "EUR" | "INR";
        color?: string;
        startDate: string;
        renewalDate?: string;
        paymentMethod: string;
    }

    interface SubscriptionStore {
        subscriptions: Subscription[];
        loading: boolean;
        error: string | null;
        fetchSubscriptions: (token: string) => Promise<void>;
        createSubscription: (token: string, payload: CreateSubscriptionPayload) => Promise<void>;
        cancelSubscription: (token: string, id: string) => Promise<void>;
        addSubscription: (subscription: Subscription) => void;
        setSubscriptions: (subscriptions: Subscription[]) => void;
        deleteSubscription: (id: string) => void;
        deleteMultiple: (ids: string[]) => void;
        selectionMode: boolean;
        selectedIds: string[];
        setSelectionMode: (value: boolean) => void;
        toggleSelectedId: (id: string) => void;
        clearSelection: () => void;
        sortBy: "name" | "price" | "date";
        sortByName: () => void;
        sortByPrice: () => void;
        sortByDate: () => void;
        filterByStatus: "all" | "active" | "canceled";
        setFilterByStatus: (status: "all" | "active" | "canceled") => void;
        currency: "INR" | "EUR" | "USD";
        setCurrency: (currency: "INR" | "EUR" | "USD") => void;
        budget: number | null;
        setBudget: (amount: number | null) => void;
        overSpendingAlert: boolean;
        setOverSpendingAlert: (value: boolean) => void;
        convertPrice: (price: number, fromCurrency: "INR" | "USD" | "EUR", toCurrency: "INR" | "USD" | "EUR") => number;
        getTotalMonthly: () => number;
    }
}

export { };
