import React, { useEffect, useState } from 'react';
import { useRouter } from "expo-router";
import { Image, Text, View, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useToken } from "./context/TokenContext";

const ProfileScreen = () => {
  const router = useRouter();
  const { token } = useToken();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Fetch user profile data when component mounts
  useEffect(() => {
    if (token && token.user_id) {
      fetch(`http://localhost:5000/api/items/profile-info?userId=${token.user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsername(data.username);  // Set username (read-only)
          setName(data.name);
          setAge(data.age);
          setDescription(data.description);
          setProfileImage(data.imageURL);
        })
        .catch((error) => console.error("Error fetching profile data:", error));
    }
  }, [token]);

  // Manage data modification
  const handleSaveChanges = () => {
    console.log('Profile Updated');
    // Send updated profile data to backend

    if (token && token.user_id) {
      fetch(`http://localhost:5000/api/items/modify-profile?userId=${token.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: token.user_id,
          name: name,
          age: age,
          description: description,
          imageURL: profileImage,
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Profile updated:", data);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "There was an issue updating your profile.");
      });
    }
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
        { profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Image
            source={{ uri: 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg' }}
            style={styles.profileImage}
          />
        )}
      </TouchableOpacity>

      {/* Profile fields */}
      <View style={styles.form}>
        {/* Username (non-editable) */}
        <TextInput
          style={styles.input}
          value={username}
          editable={false}
          placeholder="Username"
        />

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
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
    width: 150,
    height: 150,
    borderRadius: 70,
    backgroundColor: '#333',
    borderColor: '#666',
    borderWidth: 0.5,
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
  },
  input: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    paddingLeft: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '75%',
  },
  descriptionInput: {
    paddingTop: 5,
    height: 80,
  },
  saveButton: {
    backgroundColor: '#F05858',
    paddingVertical: 7.5,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 5,
    width: '30%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;
