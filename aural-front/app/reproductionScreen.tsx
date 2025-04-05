// app/(tabs)/LoginPage.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginHeader from './components/loginHeader';
import { useEffect, useRef, useState  } from 'react';
import axios from 'axios';
import { useToken } from './context/TokenContext';
import { useRouter } from 'expo-router';

const ReproductionScreen = () => {
  const { token } = useToken();
  const router = useRouter();

  // useEffect(() => {
  //   if (token) {
  //     router.push('/(tabs)/homeScreen');
  //   } else {
  //     router.push('/loginScreen');
  //   }
  // }, [token, router]);

  return (
    <SafeAreaView >
      <LoginHeader />
    </SafeAreaView>
  );
}
