import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import OpenButton from '../components/openButton';
import OptionsModal from '../components/optionsModal';
import PublishModal from '../components/publishModal';

const { width, height } = Dimensions.get('window');

const initialPublications = [
  { id: '1', text: 'First publication' },
  { id: '2', text: 'Second publication' },
  { id: '3', text: 'Third publication' },
];

const SimplePublicationScreen: React.FC = () => {
  const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
  const [publishVisible, setPublishVisible] = useState<boolean>(false);
  const [publicationText, setPublicationText] = useState<string>('');
  const [publications, setPublications] = useState(initialPublications);

  const router = useRouter();

  const handlePublish = () => {
    if (publicationText.trim() === '') {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    const newPub = { id: (publications.length + 1).toString(), text: publicationText };
    setPublications([newPub, ...publications]);
    setPublicationText('');
    setPublishVisible(false);
    Alert.alert('Success', 'Publication submitted (simulated)');
    // TODO: Integrate with database to persist the publication
  };

  const handleReload = () => {
    Alert.alert('Reload', 'Feed reloaded (simulated)');
    // TODO: Integrate with database to reload publications from backend
  };

  const handleViewPublications = () => {
    // Navega a la pantalla de feed para ver publicaciones
    // TODO: Integrate with database in FeedScreen to display live data
    router.push('/feedScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OpenButton onPress={() => setOptionsVisible(true)} />

      <OptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onViewPublications={handleViewPublications}
        onPublish={() => setPublishVisible(true)}
      />

      <PublishModal
        visible={publishVisible}
        onClose={() => setPublishVisible(false)}
        publicationText={publicationText}
        onChangeText={setPublicationText}
        onSubmit={handlePublish}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimplePublicationScreen;
