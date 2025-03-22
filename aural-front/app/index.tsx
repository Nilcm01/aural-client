import { Text, View } from "react-native";
import FooterBar from "./components/footerBar";
import AppBar from "./components/appBar";  

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DBDDDF",
      }}
    >
      <AppBar />
      <Text>Welcome to Aural's first home page!</Text>
      <FooterBar />
    </View>
  );
}
