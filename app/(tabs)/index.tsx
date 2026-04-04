import "@/global.css";
import { Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function HomeTab() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans-extrabold"> Home</Text>

      <Link
        href="/(auth)/Sign_in"
        className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
      >
        Go to Sign In
      </Link>

      <Link
        href="/(auth)/Sign_up"
        className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
      >
        Go to Sign Up
      </Link>

      {/* <Link
        href="/Onboarding"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Onboarding
      </Link> */}

    </SafeAreaView>
  );
}
