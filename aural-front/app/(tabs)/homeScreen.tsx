import { View, Text } from "react-native";
import AppBar from "../components/appBar";
import FooterBar from "../components/footerBar";

export default function HomeScreen() {
  return (
    <View>
      <Text>Home Screen</Text>
        <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#DBDDDF",
        }}
      >
        <AppBar />
        <FooterBar />
      </View>
    </View>
  );
}
