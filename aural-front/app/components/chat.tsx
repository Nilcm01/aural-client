import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import { View, Text, Button, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useToken } from "../context/TokenContext";
import { useReproBarVisibility } from "../components/WebPlayback";
import { Picker } from '@react-native-picker/picker'; // Import the Picker component

const API_URL = 'https://aural-454910.ew.r.appspot.com/api/items/';

export default function Chat() {
    const { token } = useToken();
    const { showReproBar } = useReproBarVisibility();
    showReproBar(false); // Hide the playback bar

    const searchParams = useLocalSearchParams();
    const { chatId } = Array.isArray(searchParams) ? searchParams[0] : searchParams;

    // Ensure chatId is available
    if (!chatId) {
        return <Text style={{ color: "white" }}>Chat ID is missing</Text>;
    }

    interface User {
        id: string;
        username: string;
        admin?: boolean;
    }

    interface Message {
        userId: string;
        txt: string;
        dt: string;
    }

    interface Metadata {
        id: string;
        name: string;
        private: boolean;
    }

    const scrollViewRef = useRef<ScrollView>(null); // Create a ref for the ScrollView

    const [chatData, setChatData] = useState<Metadata>();
    const [userList, setUserList] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    const [newMessage, setNewMessage] = useState<string>("");

    function sendMessage(chatId: string, message: string) {
        console.log("Sending message:", message);

        if (!message.trim()) {
            console.error("Message cannot be empty");
            return;
        }

        const sendMessageToApi = async () => {
            try {
                const urlApi = `${API_URL}chat-send-message`;
                const response = await fetch(urlApi, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "chatId": chatId,
                        userId: token?.user_id,
                        "txt": message,
                    }),
                });

                const responseData = await response.json();
                console.log("Response from API:", responseData);
                if (responseData.return === 1) {
                    // Update the local messages state
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            userId: token?.user_id || "",
                            txt: message,
                            dt: new Date().toISOString(),
                        },
                    ]);
                } else {
                    console.error("Error sending message:", responseData.message);
                }

                setNewMessage(""); // Clear the input field after sending the message
            } catch (error) {
                console.error("Error sending message:", error);
            }
        };

        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }

        sendMessageToApi();
    }

    useFocusEffect(
        useCallback(() => {
            const fetchMetadata = async () => {
                try {
                    const urlApi = API_URL + 'chat-metadata?chatId=' + chatId;
                    const getChatMetadataApi = fetch(urlApi, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await getChatMetadataApi;
                    const chatData = await result.json();

                    const chatDataInterface: Metadata = {
                        id: chatData.id,
                        name: chatData.name,
                        private: chatData.private
                    };
                    setChatData(chatDataInterface);

                    // console.log("Chat metadata:", chatData);
                } catch (error) {
                    console.error("Error fetching metadata:", error);
                }
            };

            const fetchMessages = async () => {
                try {
                    if (!chatId) {
                        console.error("Chat id is not defined");
                        return;
                    }

                    const urlApi = API_URL + 'chat-messages?chatId=' + chatId;
                    const getMessagesFromChatApi = fetch(urlApi, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await getMessagesFromChatApi;
                    const recMessages = await result.json();

                    const messagesInterface: Message[] = recMessages.map((message: any) => ({
                        userId: message.userId,
                        txt: message.txt,
                        dt: message.dt
                    }));

                    // Check if the last message received is the same as the last message in the state
                    if (messagesInterface.length > 0) {
                        const lastMessage = messagesInterface[messagesInterface.length - 1];
                        const lastStateMessage = messages[messages.length - 1];
                        if (lastStateMessage !== undefined) {
                            if (lastMessage.dt !== lastStateMessage.dt) {
                                setMessages(messagesInterface);
                            }
                        } else {
                            setMessages(messagesInterface);
                        }
                    }

                    // console.log("Chat messages:", messages);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            };

            const fetchUserList = async () => {
                try {
                    if (!chatId) {
                        console.error("Chat id is not defined");
                        return;
                    }

                    const urlApi = API_URL + 'chat-users?chatId=' + chatId;
                    const getMessagesFromChatApi = fetch(urlApi, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await getMessagesFromChatApi;
                    const users = await result.json();

                    const usersInterface: User[] = users.map((user: any) => ({
                        id: user.userId,
                        username: user.name,
                        admin: user.admin
                    }));
                    setUserList(usersInterface);

                    // console.log("Chat users:", users);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            };

            // Execute the functions immediately
            fetchMetadata();
            fetchMessages();
            fetchUserList();

            // Set up the interval
            const interval = setInterval(() => {
                fetchMetadata();
                fetchMessages();
                fetchUserList();
            }, 5000);

            // Cleanup interval when the screen is unfocused
            return () => clearInterval(interval);
        }, [chatId])
    );

    // Create a list of messages to display
    const messageList = messages.map((message) => {
        const user = userList.find(user => user.id === message.userId);

        //// Date formatting

        const dt_now = new Date();
        const dt = new Date(message.dt);
        // If day is less than 10, add a leading zero
        const dt_day = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
        const dt_month = dt.getMonth() < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1;
        const dt_year = dt.getFullYear();
        const dt_hour = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
        const dt_minute = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
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
    const [editedGroupName, setEditedGroupName] = useState<string>();
    const [editedUserList, setEditedUserList] = useState<User[]>([]);
    const [friendsList, setFriendsList] = useState<String[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<string | undefined>(); // State for the selected friend

    useEffect(() => {
        // Fetch friends for the option to add new members
        const fetchFriends = async () => {
            try {
                const urlApi = API_URL + 'friends?userId=' + token?.user_id;
                const getFriendsFromUserApi = fetch(urlApi, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await getFriendsFromUserApi;
                const friends = await result.json();
                setFriendsList(friends.friends);
                // console.log("User friends:", friends.friends);

            } catch (error) {
                console.error("Error calling internal API:", error);
            }

            return true;
        };

        fetchFriends();
    }, []);



    const [selfRemovalWarning, setSelfRemovalWarning] = useState(false); // State to track if the user is trying to remove themselves
    const [confirmedSelfRemoval, setConfirmedSelfRemoval] = useState(false); // Tracks if the user has confirmed self-removal

    const handleSaveGroupInfo = async () => {
        // Check if the user is trying to remove themselves
        const isRemovingSelf = editedUserList.every((user) => user.id !== token?.user_id);

        if (isRemovingSelf && !confirmedSelfRemoval) {
            setSelfRemovalWarning(true); // Show the warning
            return; // Prevent saving until the user confirms or undoes the action
        }

        try {
            // Update the group name if it has changed
            if (editedGroupName && editedGroupName !== chatData?.name) {
                const urlApi = `${API_URL}change-chat-name`;
                const response = await fetch(urlApi, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chatId: chatId,
                        newName: editedGroupName,
                    }),
                });

                const responseData = await response.json();
                if (responseData.return !== 1) {
                    throw new Error(`Failed to update group name: ${responseData.message}`);
                }
                // Update the local state with the new group name
                setChatData((prev) => (prev ? { ...prev, name: editedGroupName } : prev));
                setEditedGroupName(editedGroupName);

                console.log("Group name updated successfully");
            }

            // Add new users to the group
            const usersToAdd = editedUserList.filter(
                (user) => !userList.some((existingUser) => existingUser.id === user.id)
            );

            for (const user of usersToAdd) {
                const urlApi = `${API_URL}add-user-to-chat`;
                const response = await fetch(urlApi, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chatId: chatId,
                        userId: user.id,
                    }),
                });

                const responseData = await response.json();
                if (responseData.return !== 1) {
                    throw new Error(`Failed to add user ${user.username}: ${responseData.message}`);
                }
                // Update the local state with the new user
                setUserList((prev) => (prev ? [...prev, user] : [user]));
                setEditedUserList((prev) => (prev ? [...prev, user] : [user]));

                console.log(`User ${user.username} added successfully`);
            }

            // Remove users from the group
            const usersToRemove = userList.filter(
                (user) => !editedUserList.some((editedUser) => editedUser.id === user.id)
            );

            for (const user of usersToRemove) {
                const urlApi = `${API_URL}remove-user-from-chat`;
                const response = await fetch(urlApi, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chatId: chatId,
                        userId: user.id,
                    }),
                });

                const responseData = await response.json();
                if (responseData.return !== 1) {
                    throw new Error(`Failed to remove user ${user.username}: ${responseData.message}`);
                }
                // Update the local state by removing the user
                setUserList((prev) => (prev ? prev.filter((u) => u.id !== user.id) : prev));
                setEditedUserList((prev) => (prev ? prev.filter((u) => u.id !== user.id) : prev));

                console.log(`User ${user.username} removed successfully`);
            }

            // Update the local state with the new group name and members
            setUserList(editedUserList);

            // Close the modal
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error saving group info:", error);
        }

        if (isRemovingSelf && confirmedSelfRemoval) {
            router.push("../(tabs)/chats"); // Redirect to the chats list screen
        }
    };

    // Undo self-removal
    const undoSelfRemoval = () => {
        if (token?.user_id) {
            const self = userList.find((user) => user.id === token.user_id);
            if (self) {
                setEditedUserList((prev) => [...prev, self]); // Add the user back to the edited list
            }
        }
        setSelfRemovalWarning(false); // Hide the warning
        setConfirmedSelfRemoval(false); // Reset confirmation
    };

    const handleNewName = (name: string) => {
        setEditedGroupName(name);
    };

    const handleAddUser = () => {
        console.log("Adding user:", selectedFriend);
        // Check if selectedFriend is not empty and exists in friendsList
        if (selectedFriend && friendsList.find(friend => friend === selectedFriend)) {
            const friendToAdd: User = {
                id: selectedFriend as string,
                username: selectedFriend as string,
                admin: true
            };

            setEditedUserList(editedUserList ? [...editedUserList, friendToAdd] : [friendToAdd]);
            setSelectedFriend(""); // Reset the picker
        }
    };

    const handleRemoveUser = (userId: string) => {
        setEditedUserList(editedUserList.filter(user => user.id !== userId));
    };

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);

        setEditedGroupName(chatData?.name);
        setEditedUserList(userList);
    };

    const handleEraseGroup = async () => {
        try {
            const urlApi = `${API_URL}delete-chat`;
            const response = await fetch(urlApi, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chatId: chatId,
                }),
            });

            const responseData = await response.json();
            if (responseData.return !== 1) {
                throw new Error(`Failed to delete group: ${responseData.message}`);
            }

            // Hide all modals
            setIsModalVisible(false);
            setIsConfirmationVisible(false);
            setSelfRemovalWarning(false);
            setConfirmedSelfRemoval(false);

            console.log("Group deleted successfully");
            router.push("../(tabs)/chats"); // Redirect to the chats list screen
        } catch (error) {
            console.error("Error deleting group:", error);
        }
    };

    useEffect(() => {
        // Scroll to the bottom when the component mounts or messages update
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false); // State for the confirmation dialog



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
                    {
                        chatData?.private ?
                            // If private chat, show the username of the other user
                            userList.filter(user => user.id !== token?.user_id)[0]?.username
                            :
                            chatData?.name
                    }
                </Text>
                <Pressable onPress={() => toggleModal()} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="info" size={30} color="white" style={{ left: 0 }} />
                </Pressable>
            </View>

            {!isModalVisible && (
                <>
                    <ScrollView
                        style={{ flex: 1, marginTop: 100 }}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                        showsVerticalScrollIndicator={false}
                        ref={scrollViewRef}
                    >
                        {messageList}
                    </ScrollView>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", margin: 10, gap: 5 }}>
                        <TextInput
                            style={{ flex: 1, backgroundColor: "#262626", color: "white", padding: 10, borderRadius: 10 }}
                            placeholder="Write here your message..."
                            placeholderTextColor="#A6A6A6"
                            value={newMessage}
                            onChangeText={setNewMessage}
                        />
                        <Pressable
                            onPress={() => {
                                sendMessage(chatId, newMessage);
                                setNewMessage(""); // Clear the input field after sending the message
                            }}
                            style={{ backgroundColor: "#262626", padding: 4, borderRadius: 10, margin: 2, alignItems: "center", justifyContent: "center" }}
                        >
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
                        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", fontStyle: 'italic', marginBottom: 30 }}>Chat details</Text>
                        {
                            chatData?.private ? false : (
                                <TextInput
                                    style={{
                                        backgroundColor: "#333333",
                                        color: "white",
                                        padding: 10,
                                        borderRadius: 5,
                                        marginBottom: 20
                                    }}
                                    value={editedGroupName}
                                    onChangeText={handleNewName}
                                    placeholder="Group name"
                                    placeholderTextColor="#A6A6A6"
                                />
                            )
                        }
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", fontStyle: 'italic', marginBottom: 10 }}>Members</Text>
                        {editedUserList.map(user => (
                            <View key={user.id} style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 10
                            }}>
                                <Text style={{ color: "white" }}>{'• ' + user.username}</Text>
                                {
                                    chatData?.private ? false : (
                                        <Pressable onPress={() => handleRemoveUser(user.id)}>
                                            <MaterialIcons name="remove-circle" size={24} color="#F05858" />
                                        </Pressable>
                                    )
                                }
                            </View>
                        ))}
                        {selfRemovalWarning && (
                            <View style={{ backgroundColor: "#FFCCCC", padding: 10, borderRadius: 5, marginBottom: 10 }}>
                                <Text style={{ color: "#FF0000", fontWeight: "bold", marginBottom: 5 }}>
                                    Warning: You are trying to remove yourself from the group!
                                </Text>
                                <Text style={{ color: "#FF0000", marginBottom: 10 }}>
                                    If you proceed, you will no longer be part of this group.
                                    You will automatically return to the chats list screen.
                                </Text>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Pressable
                                        onPress={undoSelfRemoval}
                                        style={{
                                            backgroundColor: "#4CAF50",
                                            padding: 10,
                                            borderRadius: 5,
                                            alignItems: "center",
                                            flex: 1,
                                            marginRight: 5,
                                        }}
                                    >
                                        <Text style={{ color: "white", fontWeight: "bold" }}>Undo</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {
                                            setConfirmedSelfRemoval(true); // Confirm self-removal
                                            setSelfRemovalWarning(false); // Hide the warning
                                        }}
                                        style={{
                                            backgroundColor: "#FF0000",
                                            padding: 10,
                                            borderRadius: 5,
                                            alignItems: "center",
                                            flex: 1,
                                            marginLeft: 5,
                                        }}
                                    >
                                        <Text style={{ color: "white", fontWeight: "bold" }}>Confirm</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                        {
                            chatData?.private ? false : (
                                <>
                                    <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", fontStyle: 'italic', marginBottom: 10 }}>Add a Friend</Text>
                                    <View style={{
                                        backgroundColor: "#333333",
                                        borderRadius: 5,
                                        marginBottom: 20,
                                        overflow: "hidden"
                                    }}>
                                        <Picker
                                            selectedValue={selectedFriend}
                                            onValueChange={(itemValue) => setSelectedFriend(itemValue)}
                                            style={{ color: "white", backgroundColor: "#333333" }}
                                            dropdownIconColor="white"
                                        >
                                            <Picker.Item label="Select a friend" value="" color="#A6A6A6" />
                                            {friendsList
                                                .map((friend) => {
                                                    if (friend === token?.user_id) return null; // Skip the current user
                                                    if (!editedUserList.some(user => user.id === friend)) {
                                                        return (
                                                            <Picker.Item key={friend as string} label={friend as string} value={friend as string} />
                                                        );
                                                    }
                                                })
                                            }
                                        </Picker>
                                    </View>
                                    <Pressable
                                        onPress={() => handleAddUser()}
                                        style={{
                                            backgroundColor: "#4CAF50",
                                            padding: 10,
                                            borderRadius: 5,
                                            alignItems: "center",
                                            marginBottom: 20
                                        }}
                                    >
                                        <Text style={{ color: "white" }}>Add friend to group chat</Text>
                                    </Pressable>
                                </>
                            )
                        }
                        <Pressable
                            onPress={() => {
                                console.log("Erase button pressed"); // Debugging log
                                setIsConfirmationVisible(true); // Show the custom confirmation dialog
                            }}
                            style={{
                                backgroundColor: "#FF0000",
                                padding: 10,
                                borderRadius: 5,
                                alignItems: "center",
                                marginBottom: 20,
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>Erase {chatData?.private ? "chat" : "group"}</Text>
                        </Pressable>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Pressable onPress={() => toggleModal()} style={{
                                backgroundColor: "#F05858",
                                padding: 10,
                                borderRadius: 5,
                                alignItems: "center",
                                flex: 1,
                                marginRight: 5
                            }}>
                                <Text style={{ color: "white" }}>Close</Text>
                            </Pressable>
                            <Pressable onPress={handleSaveGroupInfo} style={{
                                backgroundColor: "#4CAF50",
                                padding: 10,
                                borderRadius: 5,
                                alignItems: "center",
                                flex: 1,
                                marginLeft: 5
                            }}>
                                <Text style={{ color: "white" }}>Save</Text>
                            </Pressable>
                        </View>
                        <Modal
                            visible={isConfirmationVisible}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setIsConfirmationVisible(false)}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                }}
                            >
                                <View
                                    style={{
                                        width: "80%",
                                        backgroundColor: "#262626",
                                        padding: 20,
                                        borderRadius: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: "white", fontSize: 16, marginBottom: 20 }}>
                                        Are you sure you want to erase this {chatData?.private ? "chat" : "group"}? This action cannot be undone.
                                        You will be redirected to the chats list screen.
                                    </Text>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <Pressable
                                            onPress={() => setIsConfirmationVisible(false)} // Close the dialog
                                            style={{
                                                backgroundColor: "#4CAF50",
                                                padding: 10,
                                                borderRadius: 5,
                                                alignItems: "center",
                                                flex: 1,
                                                marginRight: 5,
                                            }}
                                        >
                                            <Text style={{ color: "white" }}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => {
                                                setIsConfirmationVisible(false); // Close the dialog
                                                handleEraseGroup(); // Call the erase group function
                                            }}
                                            style={{
                                                backgroundColor: "#FF0000",
                                                padding: 10,
                                                borderRadius: 5,
                                                alignItems: "center",
                                                flex: 1,
                                                marginLeft: 5,
                                            }}
                                        >
                                            <Text style={{ color: "white" }}>Erase</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            </Modal>
        </View>
    );
}