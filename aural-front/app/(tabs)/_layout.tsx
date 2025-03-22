import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#2A496B", height: 80 },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="wifi-tethering" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="libraries"
        options={{
          title: "Libraries",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="grid-view" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
