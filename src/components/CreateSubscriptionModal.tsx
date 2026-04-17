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
import dayjs from "dayjs";
import { clsx } from "clsx";
import { icons } from "@/constants/icons";
import { getUniversalIcon } from "@/lib/getUniversalIcon";

type BillingFrequency = Subscription["billing"];

const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;

const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORY_OPTIONS)[number], string> = {
  Entertainment: "#fde68a",
  "AI Tools": "#bfdbfe",
  "Developer Tools": "#ddd6fe",
  Design: "#fecaca",
  Productivity: "#bbf7d0",
  Cloud: "#bae6fd",
  Music: "#f9a8d4",
  Other: "#e5e7eb",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const DEFAULT_ICON =
  "https://www.google.com/s2/favicons?sz=128&domain_url=https://www.google.com";

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] =
    useState<BillingFrequency>("monthly");
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>(
      "Entertainment"
    );

  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;

    const parsed = Number.parseFloat(
      price.replace(/,/g, "").trim()
    );

    return Number.isFinite(parsed) && parsed > 0;
  }, [name, price]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("monthly");
    setCategory("Entertainment");
    setNameError(null);
    setPriceError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const nextName = name.trim();
    const parsedPrice = Number.parseFloat(
      price.replace(/,/g, "").trim()
    );

    if (!nextName) {
      setNameError("Name is required.");
    } else {
      setNameError(null);
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setPriceError("Price must be a positive number.");
    } else {
      setPriceError(null);
    }

    if (
      !nextName ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0 ||
      isCreating
    ) {
      return;
    }

    setIsCreating(true);

    const startDate = dayjs();
    const renewalDate =
      frequency === "monthly"
        ? startDate.add(1, "month")
        : startDate.add(1, "year");

    const frequencyLabel =
      frequency === "monthly" ? "Monthly" : "Yearly";

    try {
      let resolvedIcon = DEFAULT_ICON;

      try {
        const iconFromAPI = await getUniversalIcon(nextName);

        if (iconFromAPI && typeof iconFromAPI === "string") {
          resolvedIcon = iconFromAPI;
        }
      } catch (err) {
        console.warn("Icon fetch failed:", err);
      }

      console.log("ICON URL:", resolvedIcon); // 🔥 DEBUG

      const subscription: Subscription = {
        id: `sub-${Date.now()}`,
        icon: resolvedIcon, // ✅ ALWAYS STRING
        name: nextName,
        category,
        plan: `${category} ${frequencyLabel} plan`,
        paymentMethod: "Manual entry",
        status: "active",
        startDate: startDate.toISOString(),
        price: Number(parsedPrice.toFixed(2)),
        currency: "INR", // ✅ India-based
        billing: frequency,
        renewalDate: renewalDate.toISOString(),
        color: CATEGORY_COLORS[category],
      };

      onCreate(subscription);
      handleClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="modal-overlay"
        onPress={handleClose}
      >
        <Pressable
          className="modal-container"
          onPress={(e) => e.stopPropagation()}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="modal-header">
              <Text className="modal-title">
                New Subscription
              </Text>
              <Pressable
                className="modal-close"
                onPress={handleClose}
              >
                <Text className="modal-close-text">x</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                {/* Name */}
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      nameError && "auth-input-error"
                    )}
                    value={name}
                    onChangeText={setName}
                    placeholder="Netflix"
                  />
                  {nameError && (
                    <Text className="auth-error">
                      {nameError}
                    </Text>
                  )}
                </View>

                {/* Price */}
                <View className="auth-field">
                  <Text className="auth-label">Price (₹)</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      priceError && "auth-input-error"
                    )}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholder="499"
                  />
                  {priceError && (
                    <Text className="auth-error">
                      {priceError}
                    </Text>
                  )}
                </View>

                {/* Frequency */}
                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {FREQUENCY_OPTIONS.map((option) => {
                      const isActive =
                        option.value === frequency;

                      return (
                        <Pressable
                          key={option.value}
                          className={clsx(
                            "picker-option",
                            isActive &&
                              "picker-option-active"
                          )}
                          onPress={() =>
                            setFrequency(option.value)
                          }
                        >
                          <Text>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Category */}
                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORY_OPTIONS.map((option) => {
                      const isActive =
                        option === category;

                      return (
                        <Pressable
                          key={option}
                          className={clsx(
                            "category-chip",
                            isActive &&
                              "category-chip-active"
                          )}
                          onPress={() =>
                            setCategory(option)
                          }
                        >
                          <Text>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Submit */}
                <Pressable
                  className={clsx(
                    "auth-button",
                    (!canSubmit || isCreating) &&
                      "auth-button-disabled"
                  )}
                  onPress={handleCreate}
                  disabled={!canSubmit || isCreating}
                >
                  <Text className="auth-button-text">
                    {isCreating
                      ? "Creating..."
                      : "Create Subscription"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CreateSubscriptionModal;