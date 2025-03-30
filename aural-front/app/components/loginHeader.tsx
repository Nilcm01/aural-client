import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useToken } from "../context/TokenContext"; // Import the TokenContext
import { router } from "expo-router";

const LoginHeader = () => {
  const { token, setToken, setCodeVerifier, getCodeVerifier } = useToken();
  const [tryAgain, setTryAgain] = useState(false); // Convert tryAgain to state

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
  const redirectUrl: string = 'http://127.0.0.1:8081/loginScreen'; // your redirect URL
  const authorizationEndpoint: string = "https://accounts.spotify.com/authorize";
  const tokenEndpoint: string = "https://accounts.spotify.com/api/token";
  const scope: string = 'user-read-private user-read-email';

  // On page load, try to fetch auth code from current browser search URL
  const args = new URLSearchParams(window.location.search);
  const code: string | null = args.get('code');

  console.log("Code: ", code);
  console.log("Token info:", token);

  // If we find a code, we're in a callback, do a token exchange
  useEffect(() => {
    const handleTokenExchange = async () => {
      if (code) {
        try {
          const codeVerifier = await getCodeVerifier(); // Ensure this is awaited
          console.log("Verifier: ", codeVerifier);
          

          const token = await getToken(code, codeVerifier as string);

          if (!token || !token.access_token) {
            console.error("Failed to exchange code for token.");
            setTryAgain(true); // Update state to show error message
            return;
          }

          const user_id = await getUserId(token.access_token);

          // Save the token data into the TokenContext
          setToken({
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires: new Date(Date.now() + token.expires_in * 1000).toISOString(),
            user_id: user_id,
          });

          // Redirect to home page
          router.push("/");
        } catch (error) {
          console.error("Error during token exchange:", error);
          setTryAgain(true); // Update state to show error message
        }
      }
    };

    handleTokenExchange();
  }, [code]);

  async function generateCodeVerifier(): Promise<string> {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

    const codeVerifier = randomString;
    const data = new TextEncoder().encode(codeVerifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);

    const codeChallengeBase64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Save the code verifier using TokenContext and wait for it to complete
    await setCodeVerifier(codeVerifier);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a 1000ms delay

    return codeChallengeBase64;
  }

  async function redirectToSpotifyAuthorize(): Promise<void> {
    try {
      const codeChallengeBase64 = await generateCodeVerifier(); // Generate code verifier and challenge

      const authUrl = new URL(authorizationEndpoint);
      const params = {
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallengeBase64,
        redirect_uri: redirectUrl,
      };

      authUrl.search = new URLSearchParams(params).toString();

      console.log("Redirecting to Spotify login...");
      window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    } catch (error) {
      console.error("Error during redirect to Spotify authorize:", error);
    }
  }

  // Spotify API Calls
  async function getToken(code: string, codeVerifier: string): Promise<TokenResponse> {
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
        code_verifier: codeVerifier,
      }),
    });

    return await response.json();
  }

  async function getUserData(accessToken: string): Promise<UserData> {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + accessToken },
    });

    return await response.json();
  }

  async function getUserId(accessToken: string): Promise<string> {
    const userData = await getUserData(accessToken);
    return userData.id;
  }

  // Click handlers
  async function loginWithSpotifyClick(): Promise<void> {
    await redirectToSpotifyAuthorize();
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