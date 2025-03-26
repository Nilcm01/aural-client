// components/registrationHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

const RegistrationHeader = () => {
  const handleRedirect = () => {
    Linking.openURL('https://www.spotify.com/signup').catch(() => {
      console.error('Failed to open Spotify signup.');
    });
  };
  
    const handleLoginNavigation = () => {
    router.push("../loginScreen");
    };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Registration</Text>
      <Text style={styles.redirectText} onPress={handleRedirect}>
        Don't have a Spotify account? Register on Spotify
      </Text>
      <Text style={styles.redirectText} onPress={handleLoginNavigation}>
        Do you have an Aural account? Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#f05858',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  redirectText: {
    fontSize: 16,
    color: '#1DB954',
    textDecorationLine: 'underline',
  },
});

export default RegistrationHeader;
