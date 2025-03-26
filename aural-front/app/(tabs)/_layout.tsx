// app/(tabs)/TabsLayout.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomFeedButton from '../components/CustomFeedButton';
import SongPlaying from '../components/songPlaying';
import ReproductionBar from '../components/reproductionBar';
import OptionsModal from '../components/optionsModal';
import PublishModal from '../components/publishModal';
import PublicationsModal from '../components/publicationsModal';
import { FooterBarButton } from '../components/footerBar';

export default function TabsLayout() {
  // Estados para controlar los modales
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publicationsModalVisible, setPublicationsModalVisible] = useState(false);

  const router = useRouter();

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
                <FooterBarButton title="Home" onPress={() => {}} />
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
                <FooterBarButton title="Sessions" onPress={() => {}} />
              </View>
            ),
          }}
        />
        {/* Pestaña para Feed: no navega, sólo abre el modal */}
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
                <FooterBarButton title="Search" onPress={() => {}} />
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
                <FooterBarButton title="Libraries" onPress={() => {}} />
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
            // Aquí se recibe el texto ingresado en el modal.
            // TODO: Implementar la lógica de publicación, por ejemplo, actualizar la BD.
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
          publications={[]} // Aquí se pasarán los datos reales o mock
          onReload={() => {
            // TODO: Implement reload logic
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
    flexDirection: "row",
    paddingHorizontal: 30,
    zIndex: 0,
  },
});
