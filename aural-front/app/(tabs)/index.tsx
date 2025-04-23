import { Text, View } from "react-native";
// import FooterBar from "../components/footerBar";
import AppBar from "../components/appBar";  
import HomeMenu from "../components/homeMenu";  
import { useReproBarVisibility } from "../components/WebPlayback";


export default function Index() {
  const { showReproBar } = useReproBarVisibility();
  showReproBar(true);
  return (
    // This is the main container for the page
    <View
      style={{
        flex: 1,
        backgroundColor: "#262626",
      }}
    >
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
      }}>
        <AppBar />
        {/* <Text style={{color: "white"}}>Welcome to Aural's first home page!</Text> */}
        <HomeMenu />
        {/* <FooterBar /> */}
      </View>
      
    </View>
  );
}
