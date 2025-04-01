import { useEffect, useState } from "react";
import { useToken } from "../context/TokenContext";
import { router, Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { token, loadToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeToken = async () => {
      await loadToken(); // Force load token from AsyncStorage
      setIsLoading(false); // Mark loading as complete
    };

    initializeToken();
  }, []);

  if (isLoading) {
    // Show a loading screen while the token is being loaded
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#141218" }}>
        <Text style={{ color: "white", fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    router.push("/loginScreen");
    return null; // Prevent rendering the tabs if not logged in
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#262626", height: 80 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="home" size={30} color={focused ? "rgb(240, 88, 88)" : "#9A9A9A"} />
              <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>Home</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="people" size={30} color={focused ? "rgb(240, 88, 88)" : "#9A9A9A"} />
              <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>Sessions</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="search" size={30} color={focused ? "rgb(240, 88, 88)" : "#9A9A9A"} />
              <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>Search</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="chat" size={30} color={focused ? "rgb(240, 88, 88)" : "#9A9A9A"} />
              <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>Chats</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="libraries"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="library-music" size={30} color={focused ? "rgb(240, 88, 88)" : "#9A9A9A"} />
              <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>Library</Text>
            </View>
          ),
        }}
      />
    </Tabs >
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  tabBarStyle: {
    height: 110,
    backgroundColor: "#262626",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 30,
    zIndex: 0,
  },
  footerButton: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
    marginTop: 4,
  },
  footerButtonSelected: {
    fontSize: 12,
    color: "rgb(240, 88, 88)",
    textAlign: "center",
    marginTop: 4,
  },
});

