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
queue: { id: string; image: string; name: string }[];
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

    const clearSongFromQueue = async (itemId: string) => {
        const accessToken = token;
    
        try {
          if (!itemId) {
            console.error("No itemId provided");
            return;
          }
    
          const indexToRemove = queue.findIndex((item) => item.id === itemId);
    
          if (indexToRemove !== -1) {
            // Elimina el item de la cola en el índice encontrado
            queue.splice(indexToRemove, 1);
            console.log("Song removed from local queue");
          } else {
            console.error("Song not found in the queue");
          }
        } catch (error) {
          console.error("Error removing song from queue:", error);
        }
      };
    
      const clearEntireQueue = async () => {
        try {
          const accessToken = token; // Asegúrate de tener el token de acceso correcto
      
          // Verificamos si la cola está vacía
          if (queue.length === 0) {
            console.log("Queue is already empty.");
            return;
          }
      
          // Verificamos si hay algo reproduciéndose en Spotify
          const playerStatusResponse = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
      
          if (!playerStatusResponse.ok) {
            throw new Error("Failed to get player status");
          }
      
          const playerStatus = await playerStatusResponse.json();
      
          // Si hay una canción reproduciéndose
          if (playerStatus.is_playing) {
            console.log("Currently playing a song, waiting for it to finish...");
      
            // Esperamos a que la canción termine. Aquí, como un ejemplo, vamos a esperar 30 segundos.
            // Puedes ajustar el tiempo de espera dependiendo de la duración de la canción.
            const songDuration = playerStatus.item.duration_ms; // Duración de la canción en milisegundos
            const waitTime = songDuration + 1000; // Un pequeño margen para asegurar que la canción haya terminado
      
            console.log(`Waiting for ${waitTime / 1000} seconds...`);
      
            await new Promise(resolve => setTimeout(resolve, waitTime));
            console.log("Song finished, stopping playback...");
          }
      
          // Detener la reproducción una vez que la canción haya terminado
          const stopResponse = await fetch('https://api.spotify.com/v1/me/player/pause', {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          });
      
          if (!stopResponse.ok) {
            throw new Error("Failed to stop playback");
          }
      
          console.log("Playback stopped. Queue should be cleared.");
      
          // Limpiar la cola localmente
          queue.length = 0;
          console.log("Local queue has been cleared.");
      
        } catch (error) {
          console.error("Error clearing entire queue:", error);
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 5 }} />
                                <Text style={{ marginLeft: 10, color: '#fff', fontWeight: "bold", fontSize: 20 }}>
                                    {item.name}
                                </Text>
                                
                                
                            </View>
                        )}
                        style={styles.queueList}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => clearEntireQueue()}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 10 }}
                >
                    <MaterialIcons name="remove-circle-outline" size={24} color="white" />
                    <Text style={{ marginLeft: 10, color: 'white', fontSize: 16 }}>Pause Queue</Text>
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
        top:0
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
