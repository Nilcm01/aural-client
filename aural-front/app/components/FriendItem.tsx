import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';

const { width } = Dimensions.get('window');

interface Friend {
  id: string;
  name: string;
}

interface FriendItemProps {
  friend: Friend;
  isRequest?: boolean;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, isRequest = false }) => {
  const handleAccept = () => {
    // TODO: Integrate with database to update friend request as accepted
    // Ejemplo: realizar una llamada a la API para aceptar la solicitud de amistad.
    Alert.alert('Accepted', `You accepted ${friend.name}`);
  };

  const handleReject = () => {
    // TODO: Integrate with database to update friend request as rejected
    // Ejemplo: realizar una llamada a la API para rechazar la solicitud de amistad.
    Alert.alert('Rejected', `You rejected ${friend.name}`);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{friend.name.charAt(0)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.friendName}>{friend.name}</Text>
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
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row', // avatar e info lado a lado
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#141218',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  friendName: {
    fontSize: 20,
    color: 'white',
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#1DB954',
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    padding: 8,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FriendItem;
