import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useToken } from "../context/TokenContext";

const ChatsScreen = () => {
    const { token } = useToken();
    const [chats, setChats] = useState<any[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [createChat, setCreateChat] = useState(false);
    const [listToShow, setListToShow] = useState<any[]>([]);

    if (!token) {
        console.error("Could not get chats: not logged in");
        return [];
    }

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const urlApi = 'http://localhost:5000/api/items/chats-from-user?userId=' + token?.user_id;
                const getChatsFromUserApi = fetch(urlApi, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await getChatsFromUserApi;
                const chats = await result.json();
                setChats(chats);
                setLoadingChats(false);
                console.log("User chats:", chats);
            } catch (error) {
                console.error("Error calling internal API:", error);
                setError("Error loading the chats module");
                setLoadingChats(false);
            }

            return true;
        };

        const fetchFriends = async () => {
            try {
                const urlApi = 'http://localhost:5000/api/items/friends?userId=' + token?.user_id;
                const getFriendsFromUserApi = fetch(urlApi, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await getFriendsFromUserApi;
                const friends = await result.json();
                setFriends(friends.friends);
                setLoadingFriends(false);
                console.log("User friends:", friends);
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
        populateShowList("chats");
    }, []);

    function populateShowList(listName: string) {
        if (listName === "friends") {
            setListToShow([
                <Pressable key={'new-group-chat'} onPress={() => createNewGroupChat()} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                    <Text style={{ color: "white", fontSize: 16, fontStyle: 'italic' }}>Create new group chat</Text>
                </Pressable>,
                friends.map((friend) => {
                    return (
                        <Pressable key={friend} onPress={() => createNewPrivateChat(friend)} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                            <Text style={{ color: "white", fontSize: 16 }}>{friend}</Text>
                        </Pressable>
                    );
                })
            ]);
        } else if (listName === "chats") {
            setListToShow(
                chats.map((chat) => {
                    const route = `../components/chat?chatId=${chat.id}`;
                    return (
                        <Pressable key={chat.id} onPress={() => router.push(route as any)} style={{ backgroundColor: "#262626", padding: 20, borderRadius: 10, margin: 10, alignItems: "flex-start", justifyContent: "flex-start" }}>
                            <Text style={{ color: "white", fontSize: 16 }}>{chat.name}</Text>
                        </Pressable>
                    );
                })
            );
        } else {
            console.error("Error: listName is not valid");
        }
    }

    function createNewPrivateChat(friend: string) {
        // const route = `../components/chat?chatId=${chat.id}`;
    }

    function createNewGroupChat() {
        // const route = `../components/chat?chatId=${chat.id}`;
    }

    function toggleNewChat() {
        // Toggle the state of the friends list
        setCreateChat(!createChat);
        console.log("Show new chat: ", createChat);

        if (!createChat) {
            populateShowList("friends");
        } else {
            populateShowList("chats");
        }

        console.log("List to show: ", listToShow);
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#000000", paddingTop: 81 }}>
            <View className="app-bar" style={{
                height: 80, backgroundColor: "#262626",
                alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "center", zIndex: 10
            }}>
                <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
                    {createChat ? "New chat" : "Chats"}
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                {
                    (loadingChats || loadingFriends) ? (
                        <Text style={{ color: "white", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>Loading chats...</Text>
                    ) : error ? (
                        <Text style={{ color: "red", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>{error}</Text>
                    ) : listToShow.length === 0 ? (
                        <Text style={{ color: "white", textAlign: "center", marginTop: 20, fontStyle: 'italic' }}>No chats found</Text>
                    ) : listToShow
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
        bottom: 100,
        right: 20
    }
});