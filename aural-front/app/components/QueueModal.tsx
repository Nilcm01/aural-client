import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';

interface QueueModalProps {
  token: string | null;
  visible: boolean;
  onClose: () => void;
  onReload: () => void;
//   info: TrackInfo[];
//   isPaused: boolean;
//   player: any;
//   currentPosition: number;
//   duration: number;
//   isShuffle: boolean;
//   toggleShuffle: () => void;
queue: any;
}

const QueueModal: React.FC<QueueModalProps> = ({
  token,
  visible,
  onClose,
  onReload,
//   info,
//   isPaused,
//   player,
//   currentPosition,
//   duration,
//   isShuffle,
//   toggleShuffle
queue
}) => {

    console.log("Queue content:", queue);
    console.log("Queue length:", queue.length);

    const skipToNext = async () => {
        try {
            const res = await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (res.ok) {
                console.log("Skipped to next track successfully");
            } else {
                console.error("Error skipping to next track", res.status);
            }
        } catch (error) {
            console.error("Error skipping track:", error);
        }
    };    

    const clearQueue = async () => {
        try {
            const res = await fetch(`https://api.spotify.com/v1/me/player/queue`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (res.ok) {
                console.log("Queue cleared successfully");
            } else {
                console.error("Error clearing queue", res.status);
            }
        } catch (error) {
            console.error("Error clearing queue:", error);
        }
    };

  return (
        <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', height: '50%' }}
      >
       
        <View style={styles.modalScreen}>
            
            
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <MaterialIcons name="close" size={30} color="#f05858" />
                </TouchableOpacity>
                
                <Text style={styles.title}>Queue of Tracks</Text>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 1 }}>
                <TouchableOpacity onPress={() => skipToNext()}>
                    <FlatList
                        data={queue}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            // Render each track in the queue
                            
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginLeft: 0 }}>
                            <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 5 }} />
                            <Text style={{ marginLeft: 0, color: '#fff', fontWeight: "bold", fontSize: 20 }}>{item.name}</Text>
                        </View>
                    )}
                    style={styles.queueList}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => clearQueue} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginLeft: 0 }}>
                    <Text style={{ marginLeft: 0, color: '#fff', fontWeight: "bold", fontSize: 20 }}>Delete Queue</Text>
                    <MaterialIcons name="delete" size={24} color="white" />
                </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        color: '#f05858',
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 5,
        textAlign: 'center',
        },
    modalScreen: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        height: '50%',
        width: '100%',
    },
    modalOverlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '30%',
        backgroundColor: '#262626',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: "center"
        },
    closeButton: {
        marginTop: 20,
        top: 0,
        right: 0,
        zIndex: 1000, 
        position: 'absolute',
        marginRight: 20
    },
    queueList: {
        width: "100%",
        height: "100%",
        backgroundColor: '#262626',
    }
});

export default QueueModal;
