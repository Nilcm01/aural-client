// app/_layout.tsx
import { Stack } from "expo-router";
import { TokenProvider, useToken } from "./context/TokenContext";
import WebPlayback from "./components/WebPlayback";
import { SharingProvider } from "./context/SharingContext";
import { QueueProvider } from "./context/QueueContext";
import { ReproBarProvider } from './components/WebPlayback';

export default function RootLayout() {
  return (
    <ReproBarProvider>
      <TokenProvider>
        <QueueProvider>
          <MainContent />
        </QueueProvider>
      </TokenProvider>
    </ReproBarProvider>
  );
}

function MainContent() {
  const { token } = useToken();
  console.log("Token in _layout:", token?.access_token);

  return (
    <>
      <SharingProvider>
        {token?.access_token && <WebPlayback token={token.access_token} />}

        <Stack screenOptions={{ headerShown: false }}>
          {/* Grupo de tabs principal */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="loginScreen" />
          <Stack.Screen name="profileScreen" />

          {/* Rutas de detalle fuera de las pestañas */}
          <Stack.Screen
            name="checkAlbumInfo/[id]"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="checkArtistInfo/[id]"
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack>
      </SharingProvider>
    </>
  );
}
