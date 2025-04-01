import { Stack } from "expo-router";
import { TokenProvider } from "./context/TokenContext";

export default function RootLayout() {
    return (
        <TokenProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="loginScreen" />
                <Stack.Screen name="profileScreen" />
            </Stack>
        </TokenProvider>
    );
}