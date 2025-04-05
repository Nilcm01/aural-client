import { useEffect, useState, useCallback } from "react";
import { useToken } from "../context/TokenContext";
import { router, Tabs } from "expo-router";
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomFeedButton from "../components/CustomFeedButton";
import SongPlaying from "../components/songPlaying";
import OptionsModal from "../components/optionsModal";
import PublishModal from "../components/publishModal";
import PublicationsModal from "../components/publicationsModal";
import ReproductionModal from "../components/reproductionModal";
import { FooterBarButton } from "../components/footerBar";

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

  // Función para publicar en el backend
  const handlePublish = async (text: string) => {
    if (text.trim() === "") {
      Alert.alert("Error", "Please enter some text");
      return;
    }
    try {
      const body = {
        userId: token.user_id,
        content: text,
      };
      console.log("Enviando publicación:", body);
      const response = await fetch(ADD_PUBLICATION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Si el backend requiere autenticación:
          // "Authorization": `Bearer ${token.access_token}`
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log("Respuesta del POST:", data);
      if (!response.ok) {
        console.error("Error en publicación:", data);
        Alert.alert("Error", data.msg || "Error publishing");
        return;
      }
      // Actualiza la lista de publicaciones con la nueva publicación al inicio
      setPublications([data, ...publications]);
      Alert.alert("Success", "Publication submitted");
      setPublishModalVisible(false);
    } catch (error) {
      console.error("Error en handlePublish:", error);
      Alert.alert("Error", "Server error while publishing");
    }
  };

  // Función para recargar las publicaciones
  const handleReload = async () => {
    try {
      console.log("Solicitando publicaciones desde:", GET_PUBLICATIONS_URL);
      const pubResponse = await fetch(GET_PUBLICATIONS_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const pubData = await pubResponse.json();
      console.log("Respuesta del GET publicaciones:", pubData);
      if (!pubResponse.ok) {
        console.error("Error en recarga publicaciones:", pubData);
        Alert.alert("Error", pubData.msg || "Error reloading publications");
        return;
      }
  
      // Solicita los usuarios
      console.log("Solicitando usuarios desde:", GET_USERS_URL);
      const usersResponse = await fetch(GET_USERS_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const usersData = await usersResponse.json();
      console.log("Respuesta del GET usuarios:", usersData);
  
      // Fusiona cada publicación con el userId (del usuario que coincide)
      const mergedPublications = pubData.map((pub: any) => {
        // Se busca un usuario que tenga _id o userId igual a pub.userId
        const foundUser = usersData.find(
          (user: any) => user._id === pub.userId || user.userId === pub.userId
        );
        return {
          ...pub,
          // Si se encuentra el usuario, se usa su propiedad userId (que en tu ejemplo es "testBack")
          // Si no se encuentra, se deja el valor original de pub.userId
          userIdentifier: foundUser ? foundUser.userId : pub.userId,
        };
      });
      setPublications(mergedPublications);
      Alert.alert("Reload", "Feed reloaded");
    } catch (error) {
      console.error("Error en handleReload:", error);
      Alert.alert("Error", "Server error while reloading");
    }
  };

  const openFeedModal = () => {
    setFeedModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
                <MaterialIcons name="home" size={30} color={focused ? "white" : "#9A9A9A"} />
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
                <MaterialIcons name="wifi-tethering" size={30} color={focused ? "white" : "#9A9A9A"} />
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
                <MaterialIcons name="search" size={30} color={focused ? "white" : "#9A9A9A"} />
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
                <MaterialIcons name="chat" size={30} color={focused ? "white" : "#9A9A9A"} />
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
                <MaterialIcons name="grid-view" size={30} color={focused ? "white" : "#9A9A9A"} />
                <Text style={focused ? styles.footerButtonSelected : styles.footerButton}>
                  Libraries
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>

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
            // Validación y llamado a integración
            if (text.trim() === "") {
              Alert.alert("Error", "Please enter some text");
              return;
            }
            console.log("Publicando texto:", text);
            handlePublish(text);
          }}
        />
      )}

      {/* Modal para ver publicaciones */}
      {publicationsModalVisible && (
        <PublicationsModal
          visible={publicationsModalVisible}
          onClose={() => setPublicationsModalVisible(false)}
          publications={publications} // Se pasan las publicaciones obtenidas
          onReload={handleReload}
        />
      )}

     
    </SafeAreaView>
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


