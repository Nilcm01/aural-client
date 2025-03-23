import { Text, View, Button } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import ReproductionBar from './reproductionBar';
import SongPlaying from './songPlaying';

export function FooterBarButton({ title, onPress }: { title: string; onPress: () => void }) {
    return (
        <View style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2,  }}>
            {/* FooterBar Button template */}
            {/* ToDo: add onPress event, when it is not pressed color="#9A9A9A" */}
            <Text style={{
                color: "white",
                fontSize: 12,
                fontWeight: "normal",
                textAlign: "center",
                verticalAlign: "bottom",
            }}>{title}</Text>
        </View>
    );
}

export default function FooterBar() {
    return (
        <View style={{display: "flex", flexDirection: "column", backgroundColor: "#262626", justifyContent: "center", alignItems: "center", bottom: 0, position: "absolute", width: "100%"}}>    
            {/* Music playing and actions allowed */}
            <SongPlaying />

            {/* Music linear line to show time*/}
            <ReproductionBar />

            {/* FooterBar content, exclude the line that shows music timestamp*/}
            <View className="footer-bar" style={{ height: 80, backgroundColor: "#262626", 
                alignItems: "center", bottom: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 30, 
            }}>
                {/* FooterBar content*/}
                <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: 10 }}>
                    <MaterialIcons name="home" size={30} color="white"></MaterialIcons>
                    <FooterBarButton title="Home" onPress={() => {}} />
                </View>
                <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: 10}}>
                    <MaterialIcons name="wifi-tethering" size={30} color="#9A9A9A"></MaterialIcons>
                    <FooterBarButton title="Sessions" onPress={() => {}} />
                </View>
                <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: 10 }}>
                    <MaterialIcons name="search" size={30} color="#9A9A9A"></MaterialIcons>
                    <FooterBarButton title="Search" onPress={() => {}} />
                </View>
                <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: 10 }}>
                    <MaterialIcons name="grid-view" size={30} color="#9A9A9A"></MaterialIcons>
                    <FooterBarButton title="Libraries" onPress={() => {}} />
                </View>
            </View>
        </View>
    );
  }