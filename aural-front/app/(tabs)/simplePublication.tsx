// app/(tabs)/SimplePublicationScreen.tsx
import React, { useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Dimensions, Alert, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import OptionsModal from '../components/optionsModal';
import PublishModal from '../components/publishModal';
import PublicationsModal from '../components/publicationsModal';

const { width } = Dimensions.get('window');

const initialPublications = [
  { id: '1', text: 'First publication' },
  { id: '2', text: 'Second publication' },
  { id: '3', text: 'Third publication' },
];

const SimplePublicationScreen: React.FC = () => {
  const [optionsVisible, setOptionsVisible] = useState<boolean>(true);
  const [publishVisible, setPublishVisible] = useState<boolean>(false);
  const [viewVisible, setViewVisible] = useState<boolean>(false);
  const [publicationText, setPublicationText] = useState<string>('');
  const [publications, setPublications] = useState(initialPublications);

  // Si quieres que se abra el modal cada vez que se enfoca la pantalla:
  useFocusEffect(
    useCallback(() => {
      setOptionsVisible(true);
    }, [])
  );

  const handlePublish = () => {
    if (publicationText.trim() === '') {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    const newPub = { id: (publications.length + 1).toString(), text: publicationText };
    setPublications([newPub, ...publications]);
    setPublishVisible(false);
    Alert.alert('Success', 'Publication submitted (simulated)');
    // TODO: Integrate with database to persist the publication
  };

  const handleReload = () => {
    Alert.alert('Reload', 'Feed reloaded (simulated)');
    // TODO: Integrate with database to reload publications from backend
  };

  const handleViewPublications = () => {
    console.log("View Publications pressed, setting viewVisible true");
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
