import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useToken } from "../context/TokenContext";
import { useReproBarVisibility } from "../components/WebPlayback";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = 'https://aural-454910.ew.r.appspot.com/api/items/';

interface Chat {
    _id: string;
    name: string;
    participants: {
        userId: string;
        admin: boolean;
    }[];
    private: boolean;
}

const ChatsScreen = () => {
    const { token } = useToken();
    const { showReproBar } = useReproBarVisibility();
    useFocusEffect(() => {
        showReproBar(true);
        return () => { };
    });
    const [chats, setChats] = useState<Chat[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [createChat, setCreateChat] = useState(false);

    const [chatsItems, setChatsItems] = useState<any[]>([]);
    const [friendsItems, setFriendsItems] = useState<any[]>([]);

    if (!token) {
        console.error("Could not get chats: not logged in");
        return [];
    }

    useFocusEffect(
        useCallback(() => {
            const fetchChats = async () => {
                try {
                    const urlApi = API_URL + 'chats-from-user?userId=' + token?.user_id;
                    const getChatsFromUserApi = fetch(urlApi, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await getChatsFromUserApi;
                    const chats = await result.json().then((data: any) => {
                        return data.return;
                    });
                    // Order the chats by name
                    chats.sort((a: Chat, b: Chat) => {
                        if (a.private && b.private) {
                            return a.name.localeCompare(b.name);
                        } else if (a.private) {
                            return 1;
                        } else if (b.private) {
                            return -1;
                        } else {
                            return a.name.localeCompare(b.name);
                        }
                    });
                    setChats(chats);

                    setChatsItems(
                        chats.map((chat: Chat) => {
                            const route = `../components/chat?chatId=${chat._id}`;

                            var friend: string | undefined = undefined;
                            if (chat.private) {
                                for (let i = 0; i < chat.participants.length; i++) {
                                    if (chat.participants[i].userId !== token.user_id) {
                                        friend = chat.participants[i].userId;
                                        break;
                                    }
                                }
                            }

                            return (
                                <Pressable key={chat._id} onPress={() => router.push(route as any)} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                                    <Text style={{ color: "white", fontSize: 16 }}>
                                        {
                                            chat.private ? (
                                                <Text style={{ color: "white", fontSize: 16 }}>{
                                                    friend
                                                }</Text>
                                            ) : (
                                                <Text style={{ color: "white", fontSize: 16, fontStyle: "italic" }}>{chat.name}</Text>
                                            )
                                        }
                                    </Text>
                                </Pressable>
                            );
                        })
                    );

                    setLoadingChats(false);
                    console.log("Chats loaded: ", chats);
                } catch (error) {
                    console.error("Error calling internal API:", error);
                    setError("Error loading the chats module");
                    setLoadingChats(false);
                }

                return true;
            };

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
                    // Order the friends by name
                    friends.friends.sort((a: string, b: string) => {
                        return a.localeCompare(b);
                    });
                    setFriends(friends.friends);

                    setFriendsItems([
                        <Pressable key={'new-group-chat'} onPress={() => createNewGroupChat()} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                            <Text style={{ color: "white", fontSize: 16, fontStyle: 'italic' }}>Create new group chat</Text>
                        </Pressable>,
                        ...friends.friends.map((friend: String) => {
                            return (
                                <Pressable key={friend as string} onPress={() => createNewPrivateChat(friend as string)} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                                    <Text style={{ color: "white", fontSize: 16 }}>{friend}</Text>
                                </Pressable>
                            );
                        })
                    ]);

                    setLoadingFriends(false);
                } catch (error) {
                    console.error("Error calling internal API:", error);
                    setError("Error loading the chats module");
                    setLoadingFriends(false);
                }

                return true;
            };

            fetchChats();
            fetchFriends();

            setCreateChat(false);

            return;
        }, [token])
    );


    /* 
        api call: .../create-chat (post)

            use JSON to send the data in the body
            {
                "private": true, -> true: DM // false: group
                "users": [
                    "userId-1",
                    "userId-2"
                ],
                "name": "testingroup"
            } 
    */

    const createNewPrivateChat = async (friend: string) => {
        console.log("Creating new chat with: ", friend);

        // First, refresh the chats list to ensure it's current
        try {
            const urlApi = API_URL + 'chats-from-user?userId=' + token?.user_id;
            const result = await fetch(urlApi, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await result.json();
            const refreshedChats = data.return;
            setChats(refreshedChats);
            console.log("Refreshed chats:", refreshedChats);

            // Check if the friend is already in the refreshed chats
            const found = refreshedChats.find((chat: Chat) => {
                if (!chat.private) return false; // Ensure it's a private chat
                if (chat.participants.length !== 2) return false; // Ensure exactly 2 participants

                // Check if both the user and the friend are participants
                const participants = chat.participants.map((participant: any) => participant.userId);
                return participants.includes(token.user_id) && participants.includes(friend);
            });

            console.log("Found chat: ", found);

            if (found !== undefined) {
                console.log("Chat already exists");
                const route = `../components/chat?chatId=${found._id}`;
                router.push(route as any); // Redirect to the existing chat
                return;
            }

            // Create new chat if none exists
            const createUrlApi = API_URL + 'create-chat';
            const name = "DM " + token.user_id + " " + friend;
            const response = await fetch(createUrlApi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    group: false,
                    users: [token.user_id, friend],
                    name: name,
                }),
            });

            const responseData = await response.json();
            if (responseData.return !== 1) {
                throw new Error(`Failed to create chat: ${responseData.message}`);
            }

            if (responseData.chatId) {
                console.log("Chat created successfully");
                const route = `../components/chat?chatId=${responseData.chatId}`;
                router.push(route as any); // Redirect to the new chat
            } else {
                console.error("Chat creation failed: No chatId returned");
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    const createNewGroupChat = async () => {
        // const route = `../components/chat?chatId=${chat.id}`;

        // Create an new chat with:
        // - chat.private = false
        // - chat.name = "New group chat"
        // - chat.participants = [token.user_id]
        // -> redirect to the chat

        try {
            const urlApi = API_URL + 'create-chat';
            const response = await fetch(urlApi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    group: true,
                    users: [token.user_id],
                    name: "New group chat"
                }),
            });

            const responseData = await response.json();
            if (responseData.return !== 1) {
                throw new Error(`Failed to create group: ${responseData.message}`);
            }

            if (responseData.chatId) {
                console.log("Group created successfully");
                const route = `../components/chat?chatId=${responseData.chatId}`;
                router.push(route as any); // Redirect to the chats list screen
            } else {
                console.error("Group creation failed: No chatId returned");
            }
        } catch (error) {
            console.error("Error creating group:", error);
        }
    }

    function toggleNewChat() {
        // Toggle the state of the friends list
        setCreateChat(!createChat);
        //console.log("Show new chat: ", createChat);
    }

    return (
        <View key={"chat-list-header"} style={{ flex: 1, backgroundColor: "#000000", paddingTop: 81 }}>
            <View className="app-bar" style={{
                height: 80, backgroundColor: "#262626",
                alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
            }}>
                <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
                    {createChat ? "New chat" : "Chats"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "#F05858", fontWeight: "regular", fontStyle: "italic", fontSize: 12, marginRight: 10 }}>
                        {token ? `${token.user_id}` : "No Token"}
                    </Text>
                    <MaterialIcons
                        name={token ? "person" : "login"} // Show "person" if token exists, otherwise "login"
                        size={30}
                        color="white"
                        onPress={() => {
                            if (token) {
                                router.push("/profileScreen");
                            } else {
                                router.push("/loginScreen"); // Navigate to login screen
                            }
                        }}
                    />
                    <Ionicons
                        name="people-circle-outline"
                        size={30}
                        color="white"
                        onPress={() => {
                            if (token) {
                                router.push("/FriendsScreen");
                            } else {
                                router.push("/loginScreen"); // Navigate to login screen
                            }
                        }}
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                {
                    (loadingChats || loadingFriends) ? (
                        <Text style={{ color: "white", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>Loading chats...</Text>
                    ) : error ? (
                        <Text style={{ color: "red", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>{error}</Text>
                    ) : createChat ? (
                        friendsItems.length === 0 ? (
                            <Text style={{ color: "white", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>No friends to chat with</Text>
                        ) : (
                            friendsItems
                        )
                    ) : (
                        chatsItems.length === 0 ? (
                            <Text style={{ color: "white", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>No chats yet</Text>
                        ) : (
                            chatsItems
                        )
                    )
                }
            </ScrollView>

            <Pressable onPress={() => toggleNewChat()} style={styles.addChatButton}>
                {
                    createChat ? (
                        <MaterialIcons name="close" size={24} color="white" />
                    ) : (
                        <MaterialIcons name="add" size={24} color="white" />
                    )
                }
            </Pressable>
        </View>
    );
}

export default ChatsScreen;

const styles = StyleSheet.create({
    container: {
        marginBottom: 81
    },

    addChatButton: {
        backgroundColor: "#F05858",
        padding: 20,
        borderRadius: 40,
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 140,
        right: 20
    }
});