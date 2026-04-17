import { apiRequest } from "./client";

export type BackendSubscription = {
    id: string;
    _id?: string;
    name: string;
    price: number;
    currency: string;
    frequency: "monthly" | "quarterly" | "yearly";
    category: string;
    color?: string;
    startDate: string;
    renewalDate: string;
    paymentMethod: string;
    status: "active" | "cancelled" | "expired";
    userId: string;
    createdAt: string;
    updatedAt: string;
};

type ListResponse = {
    success: boolean;
    data: BackendSubscription[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
};

type SingleResponse = {
    success: boolean;
    data: BackendSubscription;
    workflowRunId?: string | null;
};

export type CreateSubscriptionPayload = {
    name: string;
    price: number;
    currency: string;
    frequency: "monthly" | "quarterly" | "yearly";
    category: string;
    color?: string;
    startDate: string;
    renewalDate?: string;
    paymentMethod: string;
};

export const subscriptionApi = {
    list: (token: string) =>
        apiRequest<ListResponse>("/subscriptions?limit=100", {
            headers: {
                "x-user-id": "user_123",
            },
        }),

    upcoming: (token: string) =>
        apiRequest<ListResponse>("/subscriptions/upcoming?limit=100", {
            headers: {
                "x-user-id": "user_123",
            },
        }),

    getById: (token: string, id: string) =>
        apiRequest<SingleResponse>(`/subscriptions/${id}`, {
            headers: {
                "x-user-id": "user_123",
            },
        }),

    create: (token: string, payload: CreateSubscriptionPayload) =>
        apiRequest<SingleResponse>("/subscriptions", {
            method: "POST",
            headers: {
                "x-user-id": "user_123",
            },
            body: payload,
        }),

    cancel: (token: string, id: string) =>
        apiRequest<SingleResponse>(`/subscriptions/${id}/cancel`, {
            method: "PATCH",
            headers: {
                "x-user-id": "user_123",
            },
        }),

    delete: (token: string, id: string) =>
        apiRequest<SingleResponse>(`/subscriptions/${id}`, {
            method: "DELETE",
            headers: {
                "x-user-id": "user_123",
            },
        }),
};
