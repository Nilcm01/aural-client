// components/LoginForm.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

interface LoginFormProps {
  navigation?: any;
}

const LoginForm = ({ navigation }: LoginFormProps) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    console.log('Username:', username, 'Password:', password);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.inputLabel}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  form: {
    width: '90%',       // Ocupa el 90% del ancho disponible
    maxWidth: 400,      // No excede 400 píxeles en pantallas grandes
    alignSelf: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    color: 'white',
    backgroundColor: '#262626',
  },
  button: {
    height: 45,
    width: '50%',             // Botón con ancho del 50% del contenedor
    backgroundColor: '#a84223',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',      // Centra el botón horizontalmente
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});