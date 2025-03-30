import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TokenData {
    access_token: string;
    refresh_token: string;
    expires: string; // ISO string representing the expiration time
    user_id: string; // Optional user ID
}

interface TokenContextType {
    token: TokenData | null;
    setToken: React.Dispatch<React.SetStateAction<TokenData | null>>;
    logout: () => Promise<void>; // Logout function
}

const MINS_BEFORE_TO_EXPIRE = 30; // Minutes before expiration to refresh the token
const TOKEN_CHECK_INTERVAL = 1; // Minutes to check for token expiration

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<TokenData | null>(null);

    // Load token from AsyncStorage when the app starts
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");
                if (storedToken) {
                    const parsedToken: TokenData = JSON.parse(storedToken);

                    // Check if the token is close to expiring
                    const expirationTime = new Date(parsedToken.expires).getTime();
                    const currentTime = Date.now();
                    const timeLeft = expirationTime - currentTime;

                    if (timeLeft <= MINS_BEFORE_TO_EXPIRE * 60 * 1000) {
                        console.log("Token is close to expiring. Attempting to refresh...");
                        try {
                            const refreshedToken = await refreshToken(parsedToken);
                            setToken(refreshedToken);
                        } catch (error) {
                            console.error("Failed to refresh token on app load:", error);
                            setToken(null); // Clear token if refresh fails
                        }
                    } else {
                        setToken(parsedToken); // Token is still valid
                    }
                }
            } catch (error) {
                console.error("Failed to load token from AsyncStorage:", error);
            }
        };

        loadToken();
    }, []);

    // Save token to AsyncStorage whenever it changes
    useEffect(() => {
        const saveToken = async () => {
            try {
                if (token) {
                    await AsyncStorage.setItem("token", JSON.stringify(token));
                } else {
                    await AsyncStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Failed to save token to AsyncStorage:", error);
            }
        };

        saveToken();
    }, [token]);

    // Check token expiration and refresh if needed periodically
    useEffect(() => {
        const checkTokenExpiration = async () => {
            if (!token || !token.expires) return;

            const expirationTime = new Date(token.expires).getTime();
            const currentTime = Date.now();
            const timeLeft = expirationTime - currentTime;

            // If less than X minutes (X * 60 * 1000 ms) left, refresh the token
            if (timeLeft <= MINS_BEFORE_TO_EXPIRE * 60 * 1000) {
                try {
                    console.log("Token is about to expire. Refreshing...");
                    const refreshedToken = await refreshToken(token); // API call to refresh the token
                    setToken(refreshedToken);
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                }
            }
        };

        // Set an interval to check the token expiration every X minutes
        const interval = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL * 60 * 1000);

        // Cleanup the interval on unmount
        return () => clearInterval(interval);
    }, [token]);

    // Logout function to clear token data
    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token"); // Remove token from AsyncStorage
            setToken(null); // Clear token from state
            console.log("Logged out successfully.");
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <TokenContext.Provider value={{ token, setToken, logout }}>
            {children}
        </TokenContext.Provider>
    );
};

export const useToken = (): TokenContextType => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error("useToken must be used within a TokenProvider");
    }
    return context;
};

// Function for refreshing the token
async function refreshToken(token: TokenData): Promise<TokenData> {
    const url = "https://accounts.spotify.com/api/token";

    try {
        const refresh = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refresh_token,
                client_id: "beebf4e998384c24a1e7caf93cf15b61", // Replace with your actual client ID
            }),
        });

        const response = await refresh.json();

        if (!response.access_token) {
            throw new Error("Failed to refresh token: Invalid response");
        }

        const newToken: TokenData = {
            access_token: response.access_token,
            refresh_token: response.refresh_token || token.refresh_token, // Use the new refresh token if provided
            expires: new Date(Date.now() + response.expires_in * 1000).toISOString(), // Set the expiration time
            user_id: token.user_id, // Keep the same user ID
        };

        return newToken;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
}