import BarChart from "@/components/BarChart";
import ExpenseCard from "@/components/ExpenseCard";
import HistoryItem from "@/components/HistoryItem";
import OverflowMenu from "@/components/OverflowMenu";
import BackButton from "@/components/BackButton";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/util";
import { useAuth } from "@clerk/expo";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { getToken } = useAuth();
  const { subscriptions, fetchSubscriptions, getTotalMonthly } = useSubscriptionStore();

  const [menuVisible, setMenuVisible] = useState(false);
  const { onTouchStart, onTouchEnd } = useSwipeBack();

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

  const totalSubscriptions = subscriptions.length;
  const monthlyExpenses = getTotalMonthly();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weeklyData = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0, 0];

    subscriptions
      .filter((sub) => sub.status === "active" && sub.renewalDate)
      .forEach((sub) => {
        const date = dayjs(sub.renewalDate);
        if (!date.isValid()) return;

        const mondayIndex = (date.day() + 6) % 7;
        buckets[mondayIndex] += sub.price;
      });

    return buckets.map((value) => Number(value.toFixed(2)));
  }, [subscriptions]);

  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};

    subscriptions
      .filter((sub) => sub.status === "active")
      .forEach((sub) => {
        const category = sub.category || "Other";
        map[category] = (map[category] || 0) + sub.price;
      });

    return map;
  }, [subscriptions]);

  const topCategory = Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const highestSub = useMemo(() => {
    return [...subscriptions]
      .filter((sub) => sub.status === "active")
      .sort((a, b) => b.price - a.price)[0];
  }, [subscriptions]);

  const historyItems = subscriptions.map((sub) => ({
    id: sub._id || sub.id,
    name: sub.name,
    date: sub.startDate
      ? new Date(sub.startDate).toLocaleDateString()
      : "N/A",
    price: formatCurrency(sub.price, sub.currency),
    color: sub.color || "#ccc",
  }));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-6">
          <BackButton />

          <Text className="text-2xl font-sans-bold text-primary">
            Insights
          </Text>

          <Pressable
            onPress={() => setMenuVisible(true)}
            className="size-11 items-center justify-center rounded-full border border-primary/20 bg-background"
          >
            <Text className="text-xl font-sans-bold text-primary">
              •••
            </Text>
          </Pressable>
        </View>

        {/* 📊 Chart */}
        <View className="px-5">
          <Text className="text-xl font-bold mb-4">
            Weekly Spend
          </Text>
          <BarChart data={weeklyData} days={weekDays} />
        </View>

        {/* 💰 Expense Summary */}
        <View className="px-5 py-8">
          <ExpenseCard
            month="This Month"
            amount={monthlyExpenses}
            percentageChange={0}
          />
        </View>

        {/* 💡 Smart Insights */}
        <View className="px-5 mb-6">
          <Text className="text-xl font-bold mb-3">
            Insights
          </Text>

          {topCategory && (
            <Text className="text-primary mb-2">
              📂 Top Category: {topCategory[0]} ({formatCurrency(topCategory[1])})
            </Text>
          )}

          {highestSub && (
            <Text className="text-primary mb-2">
              💸 Highest: {highestSub.name} ({formatCurrency(highestSub.price, highestSub.currency)})
            </Text>
          )}

          <Text className="text-primary">
            📦 Total Subscriptions: {totalSubscriptions}
          </Text>
        </View>

        {/* 📜 History */}
        <View className="px-5 pb-10">
          <Text className="text-xl font-bold mb-4">
            Subscription History
          </Text>

          <FlatList
            data={historyItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HistoryItem
                name={item.name}
                date={item.date}
                price={item.price}
                backgroundColor={item.color}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View className="h-3" />
            )}
          />
        </View>
      </ScrollView>

      <OverflowMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Insights;
