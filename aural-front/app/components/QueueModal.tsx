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

// interface Publication {
//   id: string;
//   content: string;
//   userIdentifier: string;
// }

// export interface TrackInfo {
//   id: string;
//   name: string;
//   artist: string;
//   album: string;
//   image: string;
//   uri: string;
// }

interface QueueModalProps {
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
                    
                    <FlatList
                    data={queue}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginLeft: 0 }}>
                            <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 5 }} />
                            <Text style={{ marginLeft: 0, color: '#fff', fontWeight: "bold", fontSize: 20 }}>{item.name}</Text>
                            <MaterialIcons name="remove-circle-outline" size={20} color={"#f05858"} style={{ marginLeft: 40 }} />
                        </View>
                    )}
                    style={styles.queueList}
                    />
                    
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
