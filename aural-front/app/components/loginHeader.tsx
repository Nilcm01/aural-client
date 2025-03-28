import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authorize } from "react-native-app-auth";
import * as Linking from 'expo-linking';
import { router, useRouter } from 'expo-router';

const LoginHeader = () => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);

  const handleRedirect = () => {
    Linking.openURL('https://www.spotify.com/signup').catch(() => {
      console.error('Failed to open Spotify signup.');
    });
  };

  const handleLoginSpotify = async () => {
    await redirectToSpotifyAuthorize();
  };

  async function redirectToSpotifyAuthorize() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

    const code_verifier = randomString;
    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);

    const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    window.localStorage.setItem('code_verifier', code_verifier);

    const authUrl = new URL("https://accounts.spotify.com/authorize")
    const params = {
        response_type: 'code',
        client_id: "beebf4e998384c24a1e7caf93cf15b61",
        scope: 'user-read-private user-read-email',
        code_challenge_method: 'S256',
        code_challenge: code_challenge_base64,
        redirect_uri: "http://127.0.0.1:8081",
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
  }

  async function getToken(code: string) {
    const code_verifier = localStorage.getItem('code_verifier');

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: "beebf4e998384c24a1e7caf93cf15b61",
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: "http://127.0.0.1:8081",
            code_verifier: code_verifier || '',
        }),
    });

    return await response.json();
  }

  const saveToken = async () => {
    const currentToken = {
      get access_token() { return localStorage.getItem('access_token') || null; },
      get refresh_token() { return localStorage.getItem('refresh_token') || null; },
      get expires_in() { return localStorage.getItem('refresh_in') || null },
      get expires() { return localStorage.getItem('expires') || null },

      save: function (response: { access_token: string; refresh_token: string; expires_in: number }) {
          const { access_token, refresh_token, expires_in } = response;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('expires_in', expires_in.toString());

          const now = new Date();
          const expiry = new Date(now.getTime() + (expires_in * 1000));
          localStorage.setItem('expires', expiry.toString());
      }
    };

    async function getUserData() {
      const response = await fetch("https://api.spotify.com/v1/me", {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
      });
  
      return await response.json();
    }

      // On page load, try to fetch auth code from current browser search URL
      const args = new URLSearchParams(window.location.search);
      const code = args.get('code');

      // If we find a code, we're in a callback, do a token exchange
      if (code) {
          const token = await getToken(code);
          currentToken.save(token);
          setAccessToken(token.access_token);

          // Remove code from URL so we can refresh correctly.
          const url = new URL(window.location.href);
          url.searchParams.delete("code");

          const updatedUrl = url.search ? url.href : url.href.replace('?', '');
          window.history.replaceState({}, document.title, updatedUrl);
      }

      // If we have a token, we're logged in, so fetch user data and render logged in template
      if (currentToken.access_token) {
          const userData = await getUserData();
          router.push("../../profileScreen");    
      }

      // Otherwise we're not logged in, so render the login template
      if (!currentToken.access_token) {
        router.push("../(tabs)/libraries");   
        
      }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.redirectText} onPress={handleRedirect}>
        Don't have a Spotify account? Register on Spotify
      </Text>

      <TouchableOpacity
        onPress={handleLoginSpotify}
        style={styles.spotifyButton}
      >
        <Text style={styles.spotify}>Login with Spotify</Text>
        <MaterialIcons style={styles.icon} name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
      {accessToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenText}>Access Token:</Text>
          <Text style={styles.token}>{accessToken}</Text>
        </View>
      )}
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
  redirectText: {
    fontSize: 16,
    color: '#1DB954',
    textDecorationLine: 'underline',
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
  tokenContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  tokenText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  token: {
    fontSize: 14,
    color: '#333',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    width: '80%',
    textAlign: 'center',
  },
});


