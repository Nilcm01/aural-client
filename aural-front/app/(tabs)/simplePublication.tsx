import React, { useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Dimensions, Alert, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import OptionsModal from '../components/optionsModal';
import PublishModal from '../components/publishModal';
import PublicationsModal from '../components/publicationsModal';
import { useToken } from '../context/TokenContext';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const API_URL = 'https://aural-454910.ew.r.appspot.com/api/items/';

const { width } = Dimensions.get('window');

// Rutas del backend (asegúrate de que estas rutas sean correctas)
const GET_PUBLICATIONS_URL = API_URL + 'publications';
const ADD_PUBLICATION_URL = API_URL + 'addPublications';

const SimplePublicationScreen: React.FC = () => {
  const { token } = useToken();
  const [optionsVisible, setOptionsVisible] = useState<boolean>(true);
  const [publishVisible, setPublishVisible] = useState<boolean>(false);
  const [viewVisible, setViewVisible] = useState<boolean>(false);
  const [publicationText, setPublicationText] = useState<string>('');
  const [publications, setPublications] = useState<any[]>([]);

  // Depuración: log cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      console.log('Pantalla de publicaciones enfocada, llamando a handleReload');
      setOptionsVisible(true);
      handleReload();
    }, [])
  );

  const handlePublish = async (text: string) => {
    console.log(text);
    if (text.trim() === '') {
      console.log('Error', 'Please enter some text');
      return;
    }
    if (!token || !token.user_id) {
      console.log('Error', 'User not authenticated');
      return;
    }
    try {
      const body = {
        userId: token.user_id,
        content: text,
      };
      console.log('Enviando publicación:', body);
      const response = await fetch(ADD_PUBLICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Si el backend requiere autenticación:
          // 'Authorization': `Bearer ${token.access_token}`
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log('Respuesta del POST:', data);
      if (!response.ok) {
        console.error('Error en publicación:', data);
        Alert.alert('Error', data.msg || 'Error publishing');
        return;
      }
      setPublications([data, ...publications]);
      setPublishVisible(false);
      Alert.alert('Success', 'Publication submitted');
      setPublicationText('');
    } catch (error) {
      console.error('Error en handlePublish:', error);
      Alert.alert('Error', 'Server error while publishing');
    }
  };

  const handleReload = async () => {
    try {
      console.log('Solicitando publicaciones desde:', GET_PUBLICATIONS_URL);
      const response = await fetch(GET_PUBLICATIONS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Si el backend requiere autenticación:
          // 'Authorization': `Bearer ${token?.access_token}`
        },
      });
      const data = await response.json();
      console.log('Respuesta del GET:', data);
      if (!response.ok) {
        console.error('Error en recarga:', data);
        Alert.alert('Error', data.msg || 'Error reloading publications');
        return;
      }
      setPublications(data);
      Alert.alert('Reload', 'Feed reloaded');
    } catch (error) {
      console.error('Error en handleReload:', error);
      Alert.alert('Error', 'Server error while reloading');
    }
  };

  const handleViewPublications = () => {
    console.log('View Publications pressed, setting viewVisible true');
    setViewVisible(true);
    setOptionsVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{
        height: 80, backgroundColor: "#262626",
        alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
      }}>
        {/* To be later replaced dynamic title */}
        <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}> Feed </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#F05858", fontWeight: "regular", fontStyle: "italic", fontSize: 12, marginRight: 10 }}>
            {token ? `${token.user_id}` : "No Token"}
          </Text>
          <MaterialIcons
            name={token ? "person" : "login"} // Show "person" if token exists, otherwise "login"
            size={30}
            color="white"
            onPress={() => {
              if (token) {
                router.push("/profileScreen");
              } else {
                router.push("/loginScreen"); // Navigate to login screen
              }
            }}
          />
          <Ionicons
            name="people-circle-outline"
            size={30}
            color="white"
            onPress={() => {
              if (token) {
                router.push("/FriendsScreen");
              } else {
                router.push("/loginScreen"); // Navigate to login screen
              }
            }}
          />
        </View>
      </View>

      <OptionsModal
        onViewPublications={handleViewPublications}
        onPublish={() => setPublishVisible(true)}
      />

      {publishVisible && (
        <PublishModal
          visible={publishVisible}
          onClose={() => setPublishVisible(false)}
          onSubmit={(text: string) => {
            handlePublish(text);
          }}
        />
      )}

      {viewVisible && (
        <PublicationsModal
          visible={viewVisible}
          onClose={() => setViewVisible(false)}
          publications={publications}
          onReload={handleReload}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    color: '#f05858',
    marginBottom: 20,
  },
});

export default SimplePublicationScreen;
