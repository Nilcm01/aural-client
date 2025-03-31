import { useEffect, useState } from "react";
import { useToken } from "../context/TokenContext";
import { router, Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomFeedButton from "../components/CustomFeedButton";
import SongPlaying from "../components/songPlaying";
import ReproductionBar from "../components/reproductionBar";
import OptionsModal from "../components/optionsModal";
import PublishModal from "../components/publishModal";
import PublicationsModal from "../components/publicationsModal";
import { FooterBarButton } from "../components/footerBar";

export default function TabsLayout() {
  const { token, loadToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);

  // Estados para controlar los modales del feed
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publicationsModalVisible, setPublicationsModalVisible] = useState(false);

  useEffect(() => {
    const initializeToken = async () => {
      await loadToken(); // Carga el token desde AsyncStorage u otra fuente
      setIsLoading(false);
    };

    initializeToken();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    router.push("/loginScreen");
    return null;
  }

  const openFeedModal = () => {
    setFeedModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="home"
                  size={30}
                  color={focused ? "white" : "#9A9A9A"}
                />
                <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>
                  Home
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: "Sessions",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="wifi-tethering"
                  size={30}
                  color={focused ? "white" : "#9A9A9A"}
                />
                <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>
                  Sessions
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="simplePublication"
          options={{
            title: "Feed",
            tabBarButton: (props) => (
              <CustomFeedButton {...props} onPress={openFeedModal} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="search"
                  size={30}
                  color={focused ? "white" : "#9A9A9A"}
                />
                <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>
                  Search
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chats",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="chat"
                  size={30}
                  color={focused ? "white" : "#9A9A9A"}
                />
                <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>
                  Chats
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="libraries"
          options={{
            title: "Libraries",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="grid-view"
                  size={30}
                  color={focused ? "white" : "#9A9A9A"}
                />
                <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>
                  Libraries
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>

      {/* Componentes globales */}
      <SongPlaying />
      <ReproductionBar />

      {/* Modal de opciones para Feed */}
      {feedModalVisible && (
        <OptionsModal
          visible={feedModalVisible}
          onClose={() => setFeedModalVisible(false)}
          onViewPublications={() => {
            setPublicationsModalVisible(true);
            setFeedModalVisible(false);
          }}
          onPublish={() => {
            setPublishModalVisible(true);
            setFeedModalVisible(false);
          }}
        />
      )}

      {/* Modal para publicar */}
      {publishModalVisible && (
        <PublishModal
          visible={publishModalVisible}
          onClose={() => setPublishModalVisible(false)}
          onSubmit={(text) => {
            console.log("Published text:", text);
            setPublishModalVisible(false);
          }}
        />
      )}

      {/* Modal para ver publicaciones */}
      {publicationsModalVisible && (
        <PublicationsModal
          visible={publicationsModalVisible}
          onClose={() => setPublicationsModalVisible(false)}
          publications={[]} // Aquí se pueden pasar datos reales o de prueba
          onReload={() => {
            // Implementar lógica de recarga si es necesario
          }}
        />
      )}
    </View>
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
