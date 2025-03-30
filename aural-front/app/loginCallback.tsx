import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { useToken } from "./context/TokenContext";
import { Buffer } from 'buffer';
import { router } from 'expo-router';

const LoginCallback = () => {
    const { token, setToken } = useToken();
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const url = await Linking.getInitialURL(); // Get the initial URL
            if (url) {
                const { queryParams } = Linking.parse(url); // Parse the URL
                const code = Array.isArray(queryParams?.code) ? queryParams.code[0] : queryParams?.code;
                const error = queryParams?.error;
                const state = queryParams?.state;

                console.log("Code: ", code);
                console.log("Error: ", error);
                console.log("State: ", state);

                if (code && state) {
                    try {
                        const response = await fetch('https://accounts.spotify.com/api/token', {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded',
                                'Authorization': 'Basic ' + (Buffer.from('beebf4e998384c24a1e7caf93cf15b61' + ':' + 'fd9f5206911a45278821f2c1ee4f8914').toString('base64'))
                            },
                            body: new URLSearchParams({
                                code: code,
                                redirect_uri: 'http://127.0.0.1:8081/loginCallback',
                                grant_type: 'authorization_code'
                            }),
                        });

                        if (response.ok) {
                            const tokenData = await response.json();

                            // Get user ID
                            const userResponse = await fetch("https://api.spotify.com/v1/me", {
                                method: 'GET',
                                headers: { 'Authorization': 'Bearer ' + tokenData.access_token },
                            });

                            const user_id = await userResponse.json().then(data => data.id);

                            // Save the token data into the TokenContext
                            setToken({
                                access_token: tokenData.access_token,
                                refresh_token: tokenData.refresh_token,
                                expires: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
                                user_id: user_id,
                            });

                            // setMessage("Logged in successfully!");
                            setMessage("");
                            // Go to the main page
                            router.push("/");
                        } else {
                            setMessage(`Error on token exchange: ${response.status} - ${response.statusText}`);
                        }
                    } catch (error) {
                        setMessage(`Error during token exchange: ${error}`);
                    }
                } else if (error && state) {
                    setMessage(`Error on callback: ${error}`);
                } else {
                    setMessage("Not in a callback");
                }
            } else {
                setMessage("No URL found");
            }
        };

        handleCallback();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={{ color: 'white' }}>{message}</Text>
        </View>
    );
};

export default LoginCallback;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141218',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});