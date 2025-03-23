import { View, Text } from "react-native";
import AppBar from "../components/appBar";
import FooterBar from "../components/footerBar";

export default function HomeScreen() {
  return (
    <View>
        <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F05858",
        }}
      >
        <AppBar />
        <FooterBar />
      </View>
    </View>
  );
}
