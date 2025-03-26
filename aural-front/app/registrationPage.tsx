// app/(tabs)/RegistrationPage.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import RegistrationHeader from '../app/components/registrationHeader';
import RegistrationForm from '../app/components/registrationForm';

interface RegistrationPageProps {
  navigation?: any;
}

const RegistrationPage = ({ navigation }: RegistrationPageProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <RegistrationHeader />
      <RegistrationForm navigation={navigation} />
    </SafeAreaView>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
