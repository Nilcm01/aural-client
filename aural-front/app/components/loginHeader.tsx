import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
        scope: '\
                  user-read-private\
                  user-read-email\
                  \
                  user-top-read\
                  user-read-recently-played\
                  user-read-currently-playing\
                  user-read-playback-state\
                  user-modify-playback-state\
                  user-read-playback-position\
                  \
                  playlist-read-private\
                  playlist-read-collaborative\
                  playlist-modify-public\
                  playlist-modify-private\
                  ugc-image-upload\
                  \
                  user-library-read\
                  user-library-modify\
                  \
                  user-follow-read\
                  user-follow-modify\
                  \
                  app-remote-control\
                  streaming\
                  ',
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

      <Text style={styles.subtitle}>Login with your Spotify account to access Aural.</Text>

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

      {/* Redirect to Spotify registration page on new page */}

      <Text style={styles.redirectText} onPress={() => { 
        Linking.openURL('https://www.spotify.com/signup/'); // Open Spotify registration page
      }}>
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
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    fontStyle: 'italic',
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
    paddingRight: 15,
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