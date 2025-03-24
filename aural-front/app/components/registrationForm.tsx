import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native';

const { width } = Dimensions.get('window');

interface RegistrationFormProps {
  navigation?: any;
}

const RegistrationForm = ({ navigation }: RegistrationFormProps) => {
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateUsername = (name: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAge = (ageStr: string): boolean => {
    const ageNum = parseInt(ageStr, 10);
    if (isNaN(ageNum)) return false;
    return ageNum >= 5 && ageNum <= 90;
  };

  const validatePassword = (pass: string): boolean => {
    return pass.length >= 5 && pass.length <= 15;
  };

  const handleRegister = () => {
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!validateUsername(username)) {
      setError('Username contains invalid characters.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email format is invalid.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be 5 to 15 characters long.');
      return;
    }
    if (!validateAge(age)) {
      setError('Age must be a number between 5 and 90.');
      return;
    }

    console.log('Registration success:', { fullName, username, email, password, age });
    Alert.alert('Registration', 'Registration successful (simulated).');
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.inputLabel}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor="#aaa"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.inputLabel}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.inputLabel}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        placeholderTextColor="#aaa"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '90%',
    maxWidth: 400,
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
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    height: 45,
    width: '50%',
    backgroundColor: '#a84223',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegistrationForm;
