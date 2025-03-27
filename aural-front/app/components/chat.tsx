import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { router } from "expo-router";
import { View, Text, Button, ScrollView, Pressable, TextInput } from "react-native";

/*  DEBUG: This is a mockup of the data that will be received from the API

    userList is a list of users that are currently in the chat
    userList: [
        {
            id: "id",
            username: "username",
            ...
        },
        ...
    ]

    messages is a list of messages that have been sent in the chat
    messages: [
        {
            id: "id",
            user: "user.id",
            txt: "message",
            dt: "datetime",
            ...
        },
        ...
    ]

    metadata is the metadata of the chat
    metadata: {
        id: "id",
        name: "name",
        private: "private", -> false: group chat, true: private chat
        userList: "userList",
        ...
    } 
*/

interface User {
    id: string;
    username: string;
}

interface Message {
    id: string;
    user: string;
    txt: string;
    dt: string;
}

interface Metadata {
    id: string;
    name: string;
    private: boolean;
    userList: User[];
}

function refreshMessages(chatData: Metadata) {
    // TODO: call API to get messages
    return [
        { id: "1", user: "1", txt: "Hello, world!", dt: "2024-09-01T12:34:56Z" },
        { id: "2", user: "2", txt: "Hi there!", dt: "2024-09-01T12:35:00Z" },
        { id: "3", user: "3", txt: "Greetings!", dt: "2024-09-01T12:35:05Z" },
        { id: "4", user: "3", txt: "Prova missatge d'abans-d'ahir", dt: "2025-03-25T12:35:05Z" },
        { id: "5", user: "3", txt: "Prova missatge d'ahir", dt: "2025-03-26T12:35:05Z" },

        { id: "1", user: "1", txt: "Hello, world!", dt: "2024-09-01T12:34:56Z" },
        { id: "2", user: "2", txt: "Hi there!", dt: "2024-09-01T12:35:00Z" },
        { id: "3", user: "3", txt: "Greetings!", dt: "2024-09-01T12:35:05Z" },
        { id: "4", user: "3", txt: "Prova missatge d'abans-d'ahir", dt: "2025-03-25T12:35:05Z" },
        { id: "5", user: "3", txt: "Prova missatge d'ahir", dt: "2025-03-26T12:35:05Z" },

        { id: "6", user: "3", txt: "Prova missatge d'avui", dt: "2025-03-27T12:35:05Z" }
    ]
}

function refreshMetadata(chatId: string) {
    // TODO: call API to get metadata
    return {
        id: "1",
        name: "Nom del grup",
        private: false,
        userList: [
            { id: "1", username: "User 1" },
            { id: "2", username: "User 2" },
            { id: "3", username: "User 3" }
        ]
    }
}

function sendMessage(chatId: string, message: string) {
    // TODO: call API to send message

    (document.getElementById("new_msg") as HTMLInputElement).value = "";
}

export default function Chat(chatId: string) {

    // TODO: Population of userList and messages via API
    // DEBUG: Automatic refresh every 2 seconds
    const [chatData, setChatData] = React.useState(refreshMetadata(chatId));
    const [userList, setUserList] = React.useState(chatData.userList);
    const [messages, setMessages] = React.useState(refreshMessages(chatData));

    React.useEffect(() => {
        const interval = setInterval(() => {
            const updatedChatData = refreshMetadata(chatId);
            setChatData(updatedChatData);
            setUserList(updatedChatData.userList);
            setMessages(refreshMessages(updatedChatData));
        }, 2000);

        return () => clearInterval(interval);
    }, [chatId]);

    // Create a list of messages to display
    const messageList = messages.map((message) => {
        const user = userList.find(user => user.id === message.user);

        //// Date formatting

        const dt_now = new Date();
        const dt = new Date(message.dt);
        const dt_day = dt.getDate();
        const dt_month = dt.getMonth();
        const dt_year = dt.getFullYear();
        const dt_hour = dt.getHours();
        const dt_minute = dt.getMinutes();
        let dt_string = "";

        //// Check for partial matches
        if (dt_now.getDate() === dt_day) {
            dt_string = "avui - " + dt_hour + ":" + dt_minute;
        } else if (dt_now.getMonth() === dt_month) {
            // Check for Yesterday
            if (dt_now.getDate() - 1 === dt_day) {
                dt_string = "ahir - " + dt_hour + ":" + dt_minute;
            } else if (dt_now.getDate() - 2 === dt_day) {
                dt_string = "abans-d'ahir - " + dt_hour + ":" + dt_minute;
            } else {
                dt_string = dt_day + "/" + dt_month + " - " + dt_hour + ":" + dt_minute;
            }
        } else if (dt_now.getFullYear() === dt_year) {
            dt_string = dt_day + "/" + dt_month + " - " + dt_hour + ":" + dt_minute;
        } else {
            dt_string = dt_day + "/" + dt_month + "/" + dt_year + " - " + dt_hour + ":" + dt_minute;
        }


        return (
            <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 10, backgroundColor: "#262626", padding: 10, borderRadius: 10 }} >

                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", margin: 1 }} >
                    <Text style={{ color: "#A6A6A6", fontWeight: "regular", fontStyle: "italic", fontSize: 12, marginRight: "auto" }}>
                        {user ? user.username : "Unknown User"}
                    </Text>
                    <Text style={{ color: "#A6A6A6", marginLeft: "auto" }}>
                        {dt_string}
                    </Text>
                </View>

                <Text style={{ color: "white", fontWeight: "regular", fontSize: 18 }}>{message.txt}</Text>
            </View>
        );
    });

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <View className="app-bar" style={{
                height: 80, backgroundColor: "#262626",
                alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
            }}>
                <Pressable onPress={() => { router.back(); }} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="arrow-back" size={30} color="white" style={{ left: 0 }} />
                </Pressable>
                <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
                    {
                        chatData.name
                    }
                </Text>
                <Pressable onPress={() => { }} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="info" size={30} color="white" style={{ left: 0 }} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1, marginTop: 100 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                showsVerticalScrollIndicator={false}
                ref={(ref) => ref?.scrollToEnd({ animated: false })}
            >
                {messageList}
            </ScrollView>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", margin: 10, gap: 5 }}>
                <TextInput id="new_msg" style={{ flex: 1, backgroundColor: "#262626", color: "white", padding: 10, borderRadius: 10 }} placeholder="Missatge..." />
                <Pressable onPress={() => {
                    sendMessage(chatId, (document.getElementById("new_msg") as HTMLInputElement).value);
                }} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 10, margin: 2, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="send" size={28} color="white" />
                </Pressable>
            </View>
        </View>
    );
}

