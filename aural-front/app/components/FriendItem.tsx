import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";

const { width } = Dimensions.get("window");

interface FriendObject {
  id: string;
  name: string;
}

interface FriendItemProps {
  friend: FriendObject | string;
  isRequest?: boolean;
  currentUserId?: string;
  onAction?: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, isRequest = false, currentUserId = "Test1Friends", onAction }) => {
  // Si friend es un string, lo usamos directamente; si es un objeto, usamos su propiedad name
  const friendName = typeof friend === "string" ? friend : friend.name;
  const friendId = typeof friend === "string" ? friend : friend.id;

  const handleAccept = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items/accept-friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: friendId
        })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      Alert.alert("Accepted", `You accepted ${friendName}`);
      if (onAction) onAction();
    } catch (error) {
      console.error("Error accepting friend request", error);
      Alert.alert("Error", "Failed to accept friend request.");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items/reject-friend-request", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: friendId
        })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      Alert.alert("Rejected", `You rejected ${friendName}`);
      if (onAction) onAction();
    } catch (error) {
      console.error("Error rejecting friend request", error);
      Alert.alert("Error", "Failed to reject friend request.");
    }
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{friendName.charAt(0)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.friendName}>{friendName}</Text>
        {isRequest && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#262626",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#141218",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  avatarText: {
    fontSize: 24,
    color: "#f05858",
    fontWeight: "bold"
  },
  infoContainer: {
    flex: 1
  },
  friendName: {
    fontSize: 20,
    color: "white",
    marginBottom: 5
  },
  buttonsContainer: {
    flexDirection: "row"
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#1DB954",
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center"
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#d9534f",
    padding: 8,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  }
});

export default FriendItem;
