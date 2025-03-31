import React, { useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Dimensions, Alert, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import OptionsModal from '../components/optionsModal';
import PublishModal from '../components/publishModal';
import PublicationsModal from '../components/publicationsModal';
import { useToken } from '../context/TokenContext';

const { width } = Dimensions.get('window');

// Rutas del backend (asegúrate de que estas rutas sean correctas)
const GET_PUBLICATIONS_URL = 'http://localhost:5000/api/items/publications';
const ADD_PUBLICATION_URL = 'http://localhost:5000/api/items/addPublications';

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

  const handlePublish = async () => {
    if (publicationText.trim() === '') {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    if (!token || !token.user_id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    try {
      const body = {
        userId: token.user_id,
        content: publicationText,
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
      <Text style={styles.pageTitle}>Simple Publications</Text>
      
      <OptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onViewPublications={handleViewPublications}
        onPublish={() => setPublishVisible(true)}
      />

      {publishVisible && (
        <PublishModal
          visible={publishVisible}
          onClose={() => setPublishVisible(false)}
          onSubmit={handlePublish}
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
