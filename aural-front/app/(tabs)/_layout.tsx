import { useEffect, useState, useCallback } from "react";
import { useToken } from "../context/TokenContext";
import { router, Tabs } from "expo-router";
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomFeedButton from "../components/CustomFeedButton";
import SongPlaying from "../components/songPlaying";
import ReproductionBar from "../components/reproductionBar";
import OptionsModal from "../components/optionsModal";
import PublishModal from "../components/publishModal";
import PublicationsModal from "../components/publicationsModal";
import { FooterBarButton } from "../components/footerBar";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// URL del backend
const GET_PUBLICATIONS_URL = 'http://localhost:5000/api/items/publications';
const ADD_PUBLICATION_URL = 'http://localhost:5000/api/items/addPublications';
const GET_USERS_URL = 'http://localhost:5000/api/items/users';

export default function TabsLayout() {
  const { token, loadToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);

  // Estados para controlar los modales del feed
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publicationsModalVisible, setPublicationsModalVisible] = useState(false);
  // Estado para almacenar las publicaciones del backend
  const [publications, setPublications] = useState<any[]>([]);

  useEffect(() => {
    const initializeToken = async () => {
      await loadToken(); // Carga el token desde AsyncStorage u otra fuente
      setIsLoading(false);
    };

    initializeToken();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    router.push("/loginScreen");
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#262626", height: 80, position: "absolute", bottom: 0, width: "100%", display: "flex", flexDirection: "row", zIndex: 0, alignItems: "center", justifyContent: "space-around", borderColor: "none" },
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
        name="simplePublication"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="post" size={30} color={focused ? "rgb(240, 88, 88)" : "#9A9A9A"} />
              <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>Feed</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
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
    alignItems: "center"
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
    borderColor: "none"
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141218",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
  },
});


