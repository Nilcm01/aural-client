import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function ChatsScreen() {

    // List of all the chats of the current user

    // TODO: get all chats of the current user
    function getAllChats() {
        // TODO: get all chats of the current user via API
        // DEBUG: return a list of chats
        return [
            { id: 1, name: "Chat 1" },
            { id: 2, name: "Chat 2" },
            { id: 3, name: "Chat 3" },
            { id: 4, name: "Chat 4" }
        ];
    }

    const chats = getAllChats().map((chat) => {
        const rute = `../components/chat?chatId=${chat.id}`;
        return (
            <Pressable onPress={() => router.push(rute as any)} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                <Text style={{ color: "white", fontSize: 16 }}>{chat.name}</Text>
            </Pressable>
        );
    });

    return (
        <View style={{ flex: 1, backgroundColor: "#000000", paddingTop: 100 }}>
            <View className="app-bar" style={{
                height: 80, backgroundColor: "#262626",
                alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "center", zIndex: 10
            }}>
                <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>{"Xats"}
                </Text>
            </View>

            {/* List of chats */}
            {chats}
        </View>
    );
}
