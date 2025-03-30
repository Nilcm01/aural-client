import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useToken } from "../context/TokenContext"; // Import the TokenContext
import { router } from "expo-router";

const LoginHeader = () => {
  const [tryAgain, setTryAgain] = useState(false); // Convert tryAgain to state

  // Click handlers
  async function loginWithSpotifyClick(): Promise<void> {
    try {
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      const params = {
        client_id: 'beebf4e998384c24a1e7caf93cf15b61',
        response_type: 'code',
        redirect_uri: 'http://127.0.0.1:8081/loginCallback',
        state: Array.from(window.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join(''),
        scope: 'user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative',
        show_dialog: 'false',
      };

      authUrl.search = new URLSearchParams(params).toString();

      console.log("Redirecting to Spotify login...");
      window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    } catch (error) {
      console.error("Error during redirect to Spotify authorize:", error);
    }
  }

  ///////////////////////////

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Aural</Text>

      <TouchableOpacity
        onPress={loginWithSpotifyClick}
        style={styles.spotifyButton}
      >
        <Text style={styles.spotify}>Login with Spotify</Text>
        <MaterialIcons style={styles.icon} name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>

      {/* Show try again only if the variable is true */}
      {tryAgain && (
        <Text style={{ color: "red", marginTop: 20 }}>
          Failed to login, please try again.
        </Text>
      )}

      {/* Redirect to Spotify registration page */}

      <Text style={styles.redirectText} onPress={() => { }}>
        Don't have a Premium Spotify account? Register on Spotify
      </Text>
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
    marginBottom: 40,
  },
  redirectText: {
    fontSize: 16,
    color: '#1DB954',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
  spotifyButton: {
    width: 200,
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingBottom: 10,
    paddingLeft: 15,
    borderRadius: 5,
    flexDirection: 'row',
  },
  spotify: {
    fontSize: 20,
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  },
  icon: {
    marginTop: 12,
    marginLeft: 4,
  },
});