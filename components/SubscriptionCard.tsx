import {
    formatCurrency,
    formatStatusLabel,
    formatSubscriptionDateTime,
} from "@/lib/util";
import { clsx } from "clsx";
import React, { useEffect } from "react";
import {
    Image,
    LayoutAnimation,
    Pressable,
    Text,
    UIManager,
    View,
} from "react-native";

// Enable LayoutAnimation on Android
if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SubscriptionCard = ({
    name,
    price,
    currency,
    icon,
    billing,
    category,
    plan,
    onPress,
    expanded,
    paymentMethod,
    startDate,
    status,
    onCancelPress,
    isCancelling = false,
}: SubscriptionCardProps) => {
    const fallback = "Not provided";

    // Animate expand/collapse
    useEffect(() => {
        LayoutAnimation.configureNext(
            LayoutAnimation.create(
                200,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.opacity
            )
        );
    }, [expanded]);

    const maskPaymentMethod = (method?: string) => {
        if (!method || method === fallback) return method;
        return `****${method.slice(-4)}`; // ✅ fixed
    };

    const handleCancel = async () => {
        if (!onCancelPress || isCancelling) return;

        try {
            await onCancelPress();
        } catch (err) {
            console.error("Cancel failed:", err);
        }
    };

    return (
        <Pressable
            onPress={onPress}
            className={clsx(
                "rounded-3xl border overflow-hidden",
                expanded
                    ? "bg-subscription border-subscription"
                    : "bg-card border-border"
            )}
        >
            {/* Header */}
            <View className="px-6 py-5 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 gap-4">
                    <View className="size-14 rounded-2xl items-center justify-center bg-white/20">
                        <Image
                            source={
                                typeof icon === "string" ? { uri: icon } : icon
                            }
                            className="size-8"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-lg font-sans-bold text-primary">
                            {name}
                        </Text>

                        <Text className="text-sm font-sans-medium text-primary/70 mt-1">
                            {category?.trim() ||
                                plan?.trim() ||
                                (startDate
                                    ? formatSubscriptionDateTime(startDate)
                                    : fallback)}
                        </Text>
                    </View>
                </View>

                <View className="items-end">
                    <Text className="text-lg font-sans-bold text-primary">
                        {formatCurrency(price, currency)}
                    </Text>
                    <Text className="text-xs font-sans-medium text-primary/70 mt-1">
                        {billing}
                    </Text>
                </View>
            </View>

            {/* Expanded */}
            {expanded && (
                <View className="px-6 py-5 gap-5 border-t border-primary/10">
                    {/* Payment */}
                    <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                            <Text className="text-xs font-sans-semibold text-primary/70 uppercase">
                                Payment info
                            </Text>
                            <Text className="text-base font-sans-semibold text-primary mt-1">
                                {maskPaymentMethod(paymentMethod)}
                            </Text>
                        </View>

                        <Pressable className="rounded-full border border-primary/40 px-5 py-2">
                            <Text className="text-sm font-sans-bold text-primary">
                                Manage
                            </Text>
                        </Pressable>
                    </View>

                    {/* Plan */}
                    <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                            <Text className="text-xs font-sans-semibold text-primary/70 uppercase">
                                Plan details
                            </Text>
                            <Text className="text-base font-sans-semibold text-primary mt-1">
                                {category?.trim() || plan?.trim() || fallback}
                            </Text>
                        </View>

                        <Pressable className="rounded-full border border-primary/40 px-5 py-2">
                            <Text className="text-sm font-sans-bold text-primary">
                                Change
                            </Text>
                        </Pressable>
                    </View>

                    {/* Extra Info */}
                    <View className="gap-4 py-3 border-t border-primary/10">
                        {status && (
                            <View>
                                <Text className="text-xs font-sans-semibold text-primary/70 uppercase">
                                    Status
                                </Text>
                                <Text className="text-base font-sans-semibold text-primary mt-1">
                                    {formatStatusLabel(status)}
                                </Text>
                            </View>
                        )}

                        {startDate && (
                            <View>
                                <Text className="text-xs font-sans-semibold text-primary/70 uppercase">
                                    Started
                                </Text>
                                <Text className="text-base font-sans-semibold text-primary mt-1">
                                    {formatSubscriptionDateTime(startDate)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Cancel Button */}
                    <Pressable
                        onPress={handleCancel}
                        disabled={isCancelling || !onCancelPress}
                        className={clsx(
                            "rounded-full py-4 items-center mt-3",
                            isCancelling ? "bg-primary/50" : "bg-primary"
                        )}
                    >
                        <Text className="text-base font-sans-bold text-white">
                            {isCancelling
                                ? "Cancelling..."
                                : "Cancel Subscription"}
                        </Text>
                    </Pressable>
                </View>
            )}
        </Pressable>
    );
};

export default SubscriptionCard;
