import { Stack } from "expo-router";
import { TokenProvider, useToken } from "./context/TokenContext";
import WebPlayback from "./components/WebPlayback";

export default function RootLayout() {
    return (
        <TokenProvider>
            <MainContent />
        </TokenProvider>
    );
}

function MainContent() {
    const { token } = useToken();
    console.log("Token in _layout:", token?.access_token); // Log the token to check its value

    return (
        <>  
            <WebPlayback token={token?.access_token ?? ""} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="loginScreen" />
                <Stack.Screen name="profileScreen" />
            </Stack>
        </>
    );
}
