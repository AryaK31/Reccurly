import "@/global.css";
import { Text, View, Image, FlatList } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import {
    HOME_USER,
    HOME_BALANCE,
    UPCOMING_SUBSCRIPTIONS,
    HOME_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/util";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { useState } from "react";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

export default function HomeTab() {
    const posthog = usePostHog();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
        string | null
    >(null);

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header">
                            <View className="home-user">
                                <Image
                                    source={images.avatar}
                                    className="home-avatar"
                                />
                                <Text className="home-user-name">
                                    {HOME_USER.name}
                                </Text>
                            </View>

                            <Image
                                source={icons.add}
                                className="home-add-icon"
                            />
                            {/* <Pressable className="home-add-button">
          
        </Pressable> */}
                        </View>

                        <View className="home-balance-card">
                            <Text className="home-balance-label">Balance</Text>

                            <View className="home-balance-row">
                                <Text className="home-balance-amount">
                                    {formatCurrency(HOME_BALANCE.amount)}
                                </Text>

                                {/* formatted renewal date using dayjs API */}
                                <Text className="home-balance-date">
                                    {dayjs(HOME_BALANCE.nextRenewalDate).format(
                                        "MM/DD"
                                    )}
                                </Text>
                            </View>
                        </View>

                        <View className="mb-5">
                            <ListHeading title="Upcoming" />
                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                renderItem={({ item }) => (
                                    <UpcomingSubscriptionCard {...item} />
                                )}
                                horizontal
                                keyExtractor={(item) => item.id}
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={
                                    <Text className="home-empty-state">
                                        No upcoming subscription renewals yet
                                    </Text>
                                }
                            />
                        </View>

                        <ListHeading title="All Subscriptions" />
                    </>
                )}
                data={HOME_SUBSCRIPTIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => {
                            const isExpanding = expandedSubscriptionId !== item.id;
                            posthog.capture('subscription_card_tapped', {
                                subscription_id: item.id,
                                action: isExpanding ? 'expand' : 'collapse',
                            });
                            setExpandedSubscriptionId((prev) =>
                                prev === item.id ? null : item.id
                            );
                        }}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text className="home-empty-state">
                        No subscription renewals yet
                    </Text>
                }
                contentContainerClassName="pb-20"
            />
        </SafeAreaView>
    );
}
