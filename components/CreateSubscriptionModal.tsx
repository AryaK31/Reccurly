import { posthog } from "@/src/config/posthog";
import { clsx } from "clsx";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (payload: CreateSubscriptionPayload) => Promise<void>;
}

type Frequency = "monthly" | "yearly";

type Category =
    | "Entertainment"
    | "Food"
    | "Health"
    | "AI Tools"
    | "Developer Tools"
    | "Design"
    | "Productivity"
    | "Other";

const CATEGORIES: Category[] = [
    "Entertainment",
    "Food",
    "Health",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Other",
];

const CATEGORY_COLORS: Record<Category, string> = {
    Entertainment: "#ff6b6b",
    Food: "#f59e0b",
    Health: "#34d399",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#95e1d3",
    Other: "#d4d4d4",
};

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onSubmit,
}: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [category, setCategory] = useState<Category>("Other");
    const [currency, setCurrency] = useState<"INR" | "USD">("INR"); // ✅ INR default
    const [isCreating, setIsCreating] = useState(false);

    // ✅ Validate price
    const isValidPrice = useMemo(() => {
        const value = Number(price);
        return !isNaN(value) && value > 0;
    }, [price]);

    const isValidForm = name.trim() !== "" && isValidPrice;

    const handleSubmit = async () => {
        if (!isValidForm || isCreating) return;

        setIsCreating(true);

        const priceValue = Number(price);
        const now = dayjs();

        const renewalDate =
            frequency === "monthly"
                ? now.add(1, "month")
                : frequency === "yearly"
                ? now.add(1, "year")
                : now.add(3, "months"); // quarterly

        try {
            // Create payload for backend (not the full subscription object)
            const payload: CreateSubscriptionPayload = {
                name: name.trim(),
                price: Number(priceValue.toFixed(2)),
                currency,
                frequency,
                category,
                startDate: now.toISOString(),
                renewalDate: renewalDate.toISOString(),
                paymentMethod: "Card Payment",
            };

            // Call the submit handler (which sends to backend)
            if (onSubmit) {
                await onSubmit(payload);
            }

            posthog.capture("subscription_created", {
                name,
                price: priceValue,
                frequency,
                category,
                currency,
            });

            resetForm();
            onClose();
        } catch (error) {
            console.error("Failed to create subscription:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency("monthly");
        setCategory("Other");
        setCurrency("INR");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <Pressable className="modal-overlay" onPress={handleClose}>
                    <Pressable
                        className="modal-container"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View className="modal-header">
                            <Text className="modal-title">
                                New Subscription
                            </Text>
                            <Pressable onPress={handleClose}>
                                <Text className="text-lg">✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            className="p-5"
                            contentContainerStyle={{ gap: 20 }}
                        >
                            {/* Name */}
                            <View>
                                <Text>Name</Text>
                                <TextInput
                                    className="auth-input"
                                    placeholder="Netflix, Spotify..."
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* Price */}
                            <View>
                                <Text>
                                    Price ({currency === "INR" ? "₹" : "$"})
                                </Text>

                                <View className="flex-row items-center">
                                    <Text className="mr-2 text-lg">
                                        {currency === "INR" ? "₹" : "$"}
                                    </Text>

                                    <TextInput
                                        className="flex-1 auth-input"
                                        placeholder="0.00"
                                        value={price}
                                        onChangeText={(text) =>
                                            setPrice(
                                                text.replace(/[^0-9.]/g, "")
                                            )
                                        }
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>

                            {/* Currency */}
                            <View>
                                <Text>Currency</Text>
                                <View className="flex-row gap-3">
                                    {["INR", "USD"].map((cur) => (
                                        <Pressable
                                            key={cur}
                                            className={clsx(
                                                "picker-option",
                                                currency === cur &&
                                                    "picker-option-active"
                                            )}
                                            onPress={() =>
                                                setCurrency(
                                                    cur as "INR" | "USD"
                                                )
                                            }
                                        >
                                            <Text>
                                                {cur === "INR"
                                                    ? "₹ INR"
                                                    : "$ USD"}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Frequency */}
                            <View>
                                <Text>Frequency</Text>
                                <View className="flex-row gap-3">
                                    {["monthly", "yearly"].map((f) => (
                                        <Pressable
                                            key={f}
                                            className={clsx(
                                                "picker-option",
                                                frequency === f &&
                                                    "picker-option-active"
                                            )}
                                            onPress={() =>
                                                setFrequency(f as Frequency)
                                            }
                                        >
                                            <Text className="capitalize">
                                                {f}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Category */}
                            <View>
                                <Text>Category</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <Pressable
                                            key={cat}
                                            className={clsx(
                                                "category-chip",
                                                category === cat &&
                                                    "category-chip-active"
                                            )}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Text>{cat}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Submit */}
                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    (!isValidForm || isCreating) && "opacity-50"
                                )}
                                onPress={handleSubmit}
                                disabled={!isValidForm || isCreating}
                            >
                                <Text className="auth-button-text">
                                    {isCreating
                                        ? "Creating..."
                                        : "Create Subscription"}
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateSubscriptionModal;
