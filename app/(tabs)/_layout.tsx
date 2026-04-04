import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { tabs } from "@/constants/data";
import {colors,components} from '@/constants/theme';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clsx } from "clsx";

const tabBar=components.tabBar;

const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={clsx("tabs-pill", focused && "tabs-active")}>
          <Image
            source={icon}
            className="tabs-glyph"
            resizeMode="contain"
            //style={{ tintColor: focused ? "#081126" : "rgba(8, 17, 38, 0.55)" }}
          />
        </View>
      </View>
    );
  };

const TabLayout = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { 
            position: "absolute", 
            bottom: Math.max(insets.bottom,tabBar.horizontalInset),
            height: tabBar.height,
            marginHorizontal:tabBar.horizontalInset,
            borderRadius:tabBar.radius,
            backgroundColor:colors.primary,
            borderTopWidth:0,
            elevation:0
         },
         tabBarItemStyle:{
            paddingVertical:tabBar.height/2 - tabBar.iconFrame/1.6
         },
         tabBarIconStyle:{
            width:tabBar.iconFrame,
            height:tabBar.iconFrame,
            alignItems:'center'
         }
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
