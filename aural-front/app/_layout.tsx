import { Stack } from "expo-router";
import { TokenProvider, useToken } from "./context/TokenContext";
import WebPlayback from "./components/WebPlayback";
import { SharingProvider } from "./context/SharingContext";
import { QueueProvider } from "./context/QueueContext";

export default function RootLayout() {
  return (
    <TokenProvider>
      <QueueProvider>
        <MainContent />
      </QueueProvider>
    </TokenProvider>
  );
}

function MainContent() {
  const { token } = useToken();
  console.log("Token in _layout:", token?.access_token); // Comprobamos el token

  return (
    <>
      <SharingProvider>
        {token?.access_token && <WebPlayback token={token.access_token} />}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="loginScreen" />
          <Stack.Screen name="profileScreen" />
        </Stack>
      </SharingProvider>
    </>
  );
}
