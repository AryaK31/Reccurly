import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/util";
import { useAuth, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  const { getToken } = useAuth();
  const {
    subscriptions,
    fetchSubscriptions,
    createSubscription,
    cancelSubscription,
  } = useSubscriptionStore();

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

  // Get upcoming subscriptions (active subscriptions with renewal date within next 7 days)
  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, "days");

    return subscriptions
      .filter(
        (sub) =>
          Boolean(sub.renewalDate) &&
          sub.status === "active" &&
          dayjs(sub.renewalDate).isAfter(now) &&
          dayjs(sub.renewalDate).isBefore(nextWeek),
      )
      .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))
      .map((sub) => ({
        id: sub._id || sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: Math.max(0, dayjs(sub.renewalDate).diff(now, "day")),
      }));
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    const itemId = item._id || item.id;
    const isExpanding = expandedSubscriptionId !== itemId;
    setExpandedSubscriptionId((currentId) => (currentId === itemId ? null : itemId));
    posthog.capture(
      isExpanding ? "subscription_expanded" : "subscription_collapsed",
      {
        subscription_name: item.name,
        subscription_id: itemId,
      },
    );
  };

  const handleCreateSubscription = async (
    payload: CreateSubscriptionPayload,
  ) => {
    const token = await getToken();
    if (!token) return;

    await createSubscription(token, payload);

    posthog.capture("subscription_created", {
      subscription_name: payload.name,
      subscription_price: payload.price,
      subscription_frequency: payload.frequency,
      subscription_category: payload.category,
    });
  };

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === (item._id || item.id)}
            onPress={() => handleSubscriptionPress(item)}
            onCancelPress={async () => {
              const itemId = item._id || item.id;
              setCancellingIds((prev) => new Set(prev).add(itemId));
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
            isCancelling={cancellingIds.has(item._id || item.id)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
