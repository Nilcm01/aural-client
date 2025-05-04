// app/(tabs)/LoginPage.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginHeader from '../app/components/loginHeader';
import { useEffect, useRef, useState  } from 'react';
import axios from 'axios';
import { useReproBarVisibility } from './components/WebPlayback';
import { useFocusEffect } from 'expo-router';

interface LoginPageProps {
  navigation?: any;
}

const LoginPage = ({ navigation }: LoginPageProps) => {

  const { showReproBar } = useReproBarVisibility();
  useFocusEffect(() => {
        showReproBar(false);
        return () => {};
      });

  return (
    <SafeAreaView style={styles.container}>
      <LoginHeader />
      {/* <LoginForm navigation={navigation} /> */}
    </SafeAreaView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});