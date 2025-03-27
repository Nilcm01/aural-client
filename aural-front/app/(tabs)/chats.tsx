import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function ChatsScreen() {
    return (
        <View>
            <Text>Chats screen</Text>

            <Pressable onPress={() => router.push("../components/chat")} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="chat" size={30} color="white" style={{ left: 0 }} />
                <Text style={{ color: "white" }}>Chat (debug)</Text>
            </Pressable>
        </View>
    );
}
