// components/LoginHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const LoginHeader = () => {
  const handleRegisterNavigation = () => {
    router.push("../registrationPage");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TouchableOpacity onPress={handleRegisterNavigation}>
        <Text style={styles.registerText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#f05858',
    fontWeight: 'bold',
  },
  registerText: {
    fontSize: 16,
    color: '#1DB954',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});
