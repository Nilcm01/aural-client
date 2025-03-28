import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function ChatsScreen() {

    // List of all the chats of the current user

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <View className="app-bar" style={{
                height: 80, backgroundColor: "#262626",
                alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "center", zIndex: 10
            }}>
                <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>{"Xats"}
                </Text>
            </View>

            <Pressable onPress={() => router.push("../components/chat?chatId=1")} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start", marginTop: 100 }}>
                <Text style={{ color: "white", fontSize: 16 }}>Chat (debug)</Text>
            </Pressable>
        </View>
    );
}
