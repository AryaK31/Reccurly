import { icons } from "@/constants/icons";
import type { BackendSubscription } from "@/lib/api/subscriptions";

const categoryIcons: Record<string, keyof typeof icons> = {
    Entertainment: "spotify",
    Food: "plus",
    Health: "plus",
    Other: "plus",
    Design: "figma",
    Productivity: "notion",
    "AI Tools": "openai",
    "Developer Tools": "github",
};

export function mapBackendSubscription(
    item: BackendSubscription
): Subscription {
    const iconKey = categoryIcons[item.category] ?? "plus";
    const billing =
        item.frequency === "yearly"
            ? "yearly"
            : item.frequency === "quarterly"
            ? "quarterly"
            : "monthly";

    // Validate and map currency (INR as default base)
    const validCurrencies = ["USD", "EUR", "INR"] as const;
    const currency = validCurrencies.includes(item.currency as any)
        ? (item.currency as "USD" | "EUR" | "INR")
        : "INR"; // INR as default base

    // Map backend status to frontend enum
    const statusMap: Record<string, "active" | "paused" | "cancelled"> = {
        "active": "active",
        "cancelled": "cancelled",
        "expired": "paused",
    };
    const status = statusMap[item.status] ?? "cancelled";

    return {
        id: item.id ?? item._id ?? "",
        _id: item.id ?? item._id ?? "",
        icon: icons[iconKey],
        name: item.name,
        price: item.price,
        currency: currency,
        billing: billing,
        category: item.category,
        paymentMethod: item.paymentMethod,
        status: status,
        startDate: item.startDate,
        renewalDate: item.renewalDate,
        color: item.color,
    };
}
