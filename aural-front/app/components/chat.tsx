import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { router } from "expo-router";
import { View, Text, Button, ScrollView, Pressable, TextInput } from "react-native";
import { Modal } from "react-native";

export default function Chat(chatId: string) {

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

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editedGroupName, setEditedGroupName] = useState(chatData.name);
    const [editedUserList, setEditedUserList] = useState([...userList]);

    const handleSaveGroupInfo = () => {
        // TODO: Save the updated group name and user list via API
        setChatData({ ...chatData, name: editedGroupName, userList: editedUserList });
        setUserList(editedUserList);
        setIsModalVisible(false);
    };

    const handleAddUser = () => {
        // TODO: Add logic to add a new user
        const newUser = { id: Date.now().toString(), username: "Nou usuari" }; // Example user
        setEditedUserList([...editedUserList, newUser]);
    };

    const handleRemoveUser = (userId: string) => {
        setEditedUserList(editedUserList.filter(user => user.id !== userId));
    };

    
    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <View className="app-bar" style={{
                height: 80, backgroundColor: "#262626",
                alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
            }}>
                <Pressable onPress={() => { router.push("../(tabs)/chats") }} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="arrow-back" size={30} color="white" style={{ left: 0 }} />
                </Pressable>
                <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
                    {chatData.name}
                </Text>
                <Pressable onPress={() => setIsModalVisible(true)} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="info" size={30} color="white" style={{ left: 0 }} />
                </Pressable>
            </View>

            {!isModalVisible && (
                <>
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
                </>
            )}

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.8)"
                }}>
                    <View style={{
                        width: "90%",
                        backgroundColor: "#262626",
                        padding: 20,
                        borderRadius: 10
                    }}>
                        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Informació del xat</Text>
                        <TextInput
                            style={{
                                backgroundColor: "#333333",
                                color: "white",
                                padding: 10,
                                borderRadius: 5,
                                marginBottom: 20
                            }}
                            value={editedGroupName}
                            onChangeText={setEditedGroupName}
                            placeholder="Nom del grup"
                            placeholderTextColor="#A6A6A6"
                        />
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Membres</Text>
                        {editedUserList.map(user => (
                            <View key={user.id} style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 10
                            }}>
                                <Text style={{ color: "white" }}>{user.username}</Text>
                                <Pressable onPress={() => handleRemoveUser(user.id)}>
                                    <MaterialIcons name="remove-circle" size={24} color="#F05858" />
                                </Pressable>
                            </View>
                        ))}
                        <Pressable onPress={handleAddUser} style={{
                            backgroundColor: "#333333",
                            padding: 10,
                            borderRadius: 5,
                            alignItems: "center",
                            marginBottom: 20
                        }}>
                            <Text style={{ color: "white" }}>Afegeix un nou membre</Text>
                        </Pressable>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Pressable onPress={() => setIsModalVisible(false)} style={{
                                backgroundColor: "#F05858",
                                padding: 10,
                                borderRadius: 5,
                                alignItems: "center",
                                flex: 1,
                                marginRight: 5
                            }}>
                                <Text style={{ color: "white" }}>Tanca</Text>
                            </Pressable>
                            <Pressable onPress={handleSaveGroupInfo} style={{
                                backgroundColor: "#4CAF50",
                                padding: 10,
                                borderRadius: 5,
                                alignItems: "center",
                                flex: 1,
                                marginLeft: 5
                            }}>
                                <Text style={{ color: "white" }}>Desa</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}