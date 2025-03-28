import { Stack } from "expo-router";
import { TokenProvider } from "./components/TokenContext";

export default function RootLayout() {
  return (
    // <TokenProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    // </TokenProvider>
  );
}