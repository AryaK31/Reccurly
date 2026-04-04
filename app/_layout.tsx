import { SplashScreen, Stack } from "expo-router";
import "@/global.css";
import { useEffect } from "react";
import {useFonts} from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  //usefonts hook from expo-fonts , pass objects where key is font name and values are font files
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });


  //a hook used to load fonts and once loaded hides the splashscreen to reveal the app
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if(!fontsLoaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
