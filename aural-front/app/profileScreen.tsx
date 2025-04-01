import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ProfileScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('john_doe');
  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState('25');
  const [description, setDescription] = useState('Music enthusiast');
  const [password, setPassword] = useState('john12345');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState('https://example.com/default-image.jpg');

  // Manage data modification
  const handleSaveChanges = () => {
    console.log('Profile Updated');
  };

  // Handle navigation to the previous screen
  const goBack = () => {
    router.back();
  };

  // Handle opening options menu
  const openOptionsMenu = () => {
    console.log('Opening options menu');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.iconContainer}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity onPress={openOptionsMenu} style={styles.iconContainer}>
          <Icon name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile photo */}
      <TouchableOpacity style={styles.profileImageContainer}>
        {/* Add image */}
      </TouchableOpacity>

      {/* Profile fields */}
      <View style={styles.form}>
        {/* Name */}
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          maxLength={25}
        />

        {/* Age */}
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Age"
          keyboardType="numeric"
          maxLength={25}
        />

        {/* Description */}
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          maxLength={200} // Character limit (200 for description)
        />
      </View>

      {/* Save Changes button */}
      <Button title="Save Changes" onPress={handleSaveChanges} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    padding: 10,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    borderColor: '#666',
    borderWidth: 0.5,
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    paddingLeft: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '85%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    marginLeft: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100,
  },
});

export default ProfileScreen;
