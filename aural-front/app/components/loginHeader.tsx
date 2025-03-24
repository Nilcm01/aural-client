// components/LoginHeader.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const LoginHeader = () => {
  return <Text style={styles.title}>Welcome</Text>;
};

export default LoginHeader;

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    color: '#f05858',
    marginBottom: 40,
    fontWeight: 'bold',
  },
});
