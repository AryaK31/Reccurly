import OverflowMenu from "@/components/OverflowMenu";
import BackButton from "@/components/BackButton";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const posthog = usePostHog();
    const [menuVisible, setMenuVisible] = useState(false);
    const { onTouchStart, onTouchEnd } = useSwipeBack();

    const handleSignOut = async () => {
        posthog.capture("user_signed_out");
        try {
            await signOut();
            // Only reset analytics after successful sign-out
            posthog.reset();
        } catch (error) {
            console.error("Sign-out failed:", error);
            // Don't reset analytics if sign-out failed
        }
    };

    const displayName =
        user?.firstName ||
        user?.fullName ||
        user?.emailAddresses[0]?.emailAddress ||
        "User";
    const email = user?.emailAddresses[0]?.emailAddress;

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-6 border-b border-border">
                <BackButton />
                <Text className="text-2xl font-sans-bold text-primary flex-1 text-center">
                    Settings
                </Text>
                <Pressable
                    onPress={() => setMenuVisible(true)}
                    className="size-11 items-center justify-center rounded-full border border-primary/20 bg-background active:bg-primary/10"
                >
                    <Text className="text-xl font-sans-bold text-primary">
                        •••
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {/* User Profile Section */}
                <View className="auth-card mb-5 mt-6">
                    <View className="flex-row items-center gap-4 mb-4">
                        <Image
                            source={
                                user?.imageUrl
                                    ? { uri: user.imageUrl }
                                    : images.avatar
                            }
                            className="size-16 rounded-full"
                        />
                        <View className="flex-1">
                            <Text className="text-lg font-sans-bold text-primary">
                                {displayName}
                            </Text>
                            {email && (
                                <Text className="text-sm font-sans-medium text-muted-foreground">
                                    {email}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <View className="auth-card mb-5">
                    <Text className="text-base font-sans-semibold text-primary mb-3">
                        Account
                    </Text>
                    <View className="gap-2">
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-sm font-sans-medium text-muted-foreground">
                                Account ID
                            </Text>
                            <Text
                                className="text-sm font-sans-medium text-primary"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {user?.id?.substring(0, 20)}...
                            </Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-sm font-sans-medium text-muted-foreground">
                                Joined
                            </Text>
                            <Text className="text-sm font-sans-medium text-primary">
                                {user?.createdAt
                                    ? new Date(
                                          user.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sign Out Button */}
                <Pressable
                    className="auth-button bg-destructive mb-6"
                    onPress={handleSignOut}
                >
                    <Text className="auth-button-text text-white">
                        Sign Out
                    </Text>
                </Pressable>
            </ScrollView>

            {/* Overflow Menu */}
            <OverflowMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
};

export default Settings;
