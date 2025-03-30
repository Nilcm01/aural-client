import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useToken } from "../context/TokenContext"; // Import the TokenContext
import { router } from "expo-router";

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const LoginHeader = () => {
  const { token, setToken } = useToken();

  ///////////////////////////

  // Define types for token response and user data
  interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }

  interface UserData {
    id: string;
    display_name: string;
    email: string;
    [key: string]: any; // Allow additional properties
  }

  const clientId: string = 'beebf4e998384c24a1e7caf93cf15b61'; // your clientId
  const redirectUrl: string = 'http://127.0.0.1:8081/loginScreen'; // your redirect URL - must be localhost URL and/or HTTPS

  const authorizationEndpoint: string = "https://accounts.spotify.com/authorize";
  const tokenEndpoint: string = "https://accounts.spotify.com/api/token";
  const scope: string = 'user-read-private user-read-email';

  // Data structure that manages the current active token, caching it in localStorage
  const currentToken = {
    get access_token(): string | null {
      return localStorage.getItem('access_token');
    },
    get refresh_token(): string | null {
      return localStorage.getItem('refresh_token');
    },
    get expires_in(): string | null {
      return localStorage.getItem('expires_in');
    },
    get expires(): string | null {
      return localStorage.getItem('expires');
    },

    save: function (response: TokenResponse): void {
      const { access_token, refresh_token, expires_in } = response;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('expires', (new Date(Date.now() + expires_in * 1000)).toISOString());
    },
  };

  // On page load, try to fetch auth code from current browser search URL
  const args = new URLSearchParams(window.location.search);
  const code: string | null = args.get('code');

  // If we find a code, we're in a callback, do a token exchange
  useEffect(() => {
    const handleTokenExchange = async () => {
      if (code) {
        const token = await getToken(code);
        currentToken.save(token);
        const user_id = await getUserId();

        // Save the token data into the state
        setToken({
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expires: (new Date(Date.now() + token.expires_in * 1000)).toISOString(),
          user_id: user_id,
        });

        // Make call to internal API for user data
        try {
          const userName = await getUserName();
          const urlApi = 'http://localhost:5000/api/items/login-user?userId=' + user_id + '&name=' + userName;
          const internalApiLogin = await fetch(urlApi, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/txt'
            },
            body: new URLSearchParams({
              userId: user_id,
              name: userName,
            })
          });
        } catch (error) {
          console.error("Error calling internal API:", error);
        }

        //console.log("Internal login:", await internalApiLogin.body);

        // Remove code from URL so we can refresh correctly.
        /*const url = new URL(window.location.href);
        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace('?', '');
        window.history.replaceState({}, document.title, updatedUrl);*/

        // Redirect to home page
        router.push("/");
      }
    };

    handleTokenExchange();
  }, [code]);

  async function redirectToSpotifyAuthorize(): Promise<void> {
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

    const authUrl = new URL(authorizationEndpoint);
    const params = {
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      code_challenge_method: 'S256',
      code_challenge: code_challenge_base64,
      redirect_uri: redirectUrl,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
  }

  // Spotify API Calls
  async function getToken(code: string): Promise<TokenResponse> {
    const code_verifier = localStorage.getItem('code_verifier');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUrl,
        code_verifier: code_verifier || '',
      }),
    });

    return await response.json();
  }

  async function refreshToken(): Promise<TokenResponse> {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: currentToken.refresh_token || '',
      }),
    });

    return await response.json();
  }

  async function getUserData(): Promise<UserData> {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
    });

    return await response.json();
  }

  async function getUserId(): Promise<string> {
    const userData = await getUserData();
    return userData.id;
  }

  async function getUserName(): Promise<string> {
    const userData = await getUserData();
    return userData.display_name;
  }

  // Click handlers
  async function loginWithSpotifyClick(): Promise<void> {
    await redirectToSpotifyAuthorize();
  }

  async function logoutClick(): Promise<void> {
    localStorage.clear();
    window.location.href = redirectUrl;
  }

  async function refreshTokenClick(): Promise<void> {
    const token = await refreshToken();
    currentToken.save(token);
    console.log("Token refreshed:", token);
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
  tokenContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  tokenText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  token: {
    fontSize: 14,
    color: '#FFFFFF',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    width: '80%',
    textAlign: 'center',
  },
});


