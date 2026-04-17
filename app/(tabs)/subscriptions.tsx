import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useAuth } from "@clerk/expo";
import { useFocusEffect } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useState,useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

    const { getToken } = useAuth();
    const {
        subscriptions,
        fetchSubscriptions,
        loading,
        error,
        cancelSubscription,
    } = useSubscriptionStore();

    useEffect(() => {
        console.log("UPDATED SUBSCRIPTIONS:", subscriptions);
    }, [subscriptions]);

    useFocusEffect(
        useCallback(() => {
            const loadSubscriptions = async () => {
                const token = await getToken();
                if (!token) return;
                await fetchSubscriptions(token);
            };

            loadSubscriptions();
        }, [getToken, fetchSubscriptions])
    );

    const getSubscriptionKey = (subscription: Subscription) =>
        subscription._id || subscription.id;

    const filteredSubscriptions = subscriptions.filter(
        (subscription) =>
            subscription.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.category
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={getSubscriptionKey}
                ListHeaderComponent={
                    <View className="px-5 pt-5">
                        <Text className="text-3xl font-bold text-dark mb-5">
                            Subscriptions
                        </Text>
                        <TextInput
                            className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
                            placeholder="Search subscriptions..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {error && (
                            <View className="bg-red-100 rounded-xl p-3 mb-4">
                                <Text className="text-red-700 font-semibold">
                                    Error: {error}
                                </Text>
                            </View>
                        )}

                        {loading && (
                            <View className="items-center py-8">
                                <ActivityIndicator size="large" color="#666" />
                                <Text className="text-dark mt-2">
                                    Loading subscriptions...
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => {
                    const itemId = getSubscriptionKey(item);
                    return (
                        <SubscriptionCard
                            {...item}
                            expanded={expandedId === itemId}
                            onPress={() =>
                                setExpandedId(
                                    expandedId === itemId ? null : itemId
                                )
                            }
                            onCancelPress={async () => {
                                setCancellingIds((prev) =>
                                    new Set(prev).add(itemId)
                                );
                                try {
                                    const token = await getToken();
                                    if (!token) return;
                                    await cancelSubscription(token, itemId);
                                } finally {
                                    setCancellingIds((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.delete(itemId);
                                        return newSet;
                                    });
                                }
                            }}
                            isCancelling={cancellingIds.has(itemId)}
                        />
                    );
                }}
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center justify-center py-12">
                            <Text className="text-dark text-lg font-semibold">
                                {searchQuery
                                    ? "No subscriptions found"
                                    : "No subscriptions yet"}
                            </Text>
                            <Text className="text-dark/60 mt-2">
                                {searchQuery
                                    ? "Try a different search"
                                    : "Add your first subscription"}
                            </Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            />
        </SafeAreaView>
    );
};

export default Subscriptions;
