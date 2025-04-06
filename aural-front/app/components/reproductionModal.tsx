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
import QueueModal from './QueueModal';

export interface TrackInfo {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  uri: string;
}

interface ReproductionModalProps {
  visible: boolean;
  onClose: () => void;
  onReload: () => void;
  info: TrackInfo[];
  isPaused: boolean;
  player: any;
  currentPosition: number;
  duration: number;
  isShuffle: boolean;
  toggleShuffle: () => void;
  isOnRepeat: any;
  toggleRepeat: () => void;
  queue: any;
}

const ReproductionModal: React.FC<ReproductionModalProps> = ({
  visible,
  onClose,
  onReload,
  info,
  isPaused,
  player,
  currentPosition,
  duration,
  isShuffle,
  toggleShuffle,
  isOnRepeat,
  toggleRepeat,
  queue
}) => {
  // Llama a onReload cuando el modal se abra
  useEffect(() => {
    if (visible) {
      onReload();
    }
  }, [visible]);

  console.log("QueueModal rendered, visible:", visible);
  const [queueVisible, setQueueVisible] = useState(false);

  const openQueueModal = () => {
    setQueueVisible(true);
  };

  return (
    <View>
        <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={openQueueModal}>
              <Text style={{ color: "white", fontSize: 30, fontWeight: 'normal', top: 0, right: 0}}> 
                ≡
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Song playing</Text>
            
            <View style={{display: 'flex', flexDirection: "row", justifyContent: "center"}}>
              {info.map((track) => (
                <View key={track.id} style={{ margin: 10, alignItems: "center", marginTop: 10}}>
                  <Image source={{ uri: track.image }} style={{ width: 250, height: 250 }} />
                  <Text style={{fontWeight: "bold", fontSize: 22, color:"white", marginTop: 10}}>{track.name} </Text>
                  <Text style={{fontSize: 18, color:"white"}}>{track.artist}</Text>
                </View>
              ))}
            </View>

            <View style={styles.controls}>
                {/* On repeat button */}
                <TouchableOpacity onPress={toggleRepeat}>
                    <MaterialIcons name="repeat" size={30} color={isOnRepeat ? "#1DB954" : "white"}  style={{}}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => player?.previousTrack()}>
                    <MaterialIcons name="skip-previous" size={30} color="white"></MaterialIcons>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => player?.togglePlay()}>
                    {isPaused?  <MaterialIcons name="play-arrow" size={30} color="white"></MaterialIcons> : <MaterialIcons name="pause" size={30} color="white"></MaterialIcons>  }
                    {/* When the user is not logged in, song reproduction not available */}
                    {/* Disable play for non-premium users, ToDo */}
                    {/* <MaterialIcons name="play-disabled" size={20} color="white"></MaterialIcons> */}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => player?.nextTrack()}>
                    <MaterialIcons name="skip-next" size={30} color="white"></MaterialIcons>
                </TouchableOpacity>

                {/* Shuffle button */}
                <TouchableOpacity onPress={toggleShuffle}>
                  <MaterialIcons name="shuffle" size={30} color={isShuffle ? "#1DB954" : "white"}  style={{}}/>
                </TouchableOpacity>
            </View>
            

            <View style={{ height: 4, backgroundColor: 'gray', width: '100%', marginTop: 8, borderRadius: 2 }}>
              <View
                style={{
                  height: 4,
                  backgroundColor: '#F05858',
                  width: `${(currentPosition / duration) * 100}%`,
                }}
              />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Queue Modal (not implemented yet) */}
      {queueVisible && (
        <QueueModal
            // info= {info}
            visible={queueVisible}
            onClose={() => setQueueVisible(false)}
            onReload={() => {
                console.log("Reloading queue information...");
            }}
            queue={queue}
            // isPaused={isPaused}
            // player={player}
            // currentPosition={currentPosition}
            // duration={duration}
            // isShuffle={isShuffle}
            // toggleShuffle={toggleShuffle}
        />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    height: '80%',
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  publicationItem: {
    backgroundColor: '#141218',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    marginBottom: 10,
  },
  publicationUser: {
    fontSize: 16,
    color: '#f05858',
    fontWeight: 'bold',
  },
  publicationText: {
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    marginTop: 60,
    alignSelf: 'center',
    bottom: 0,
  },
  closeButtonText: {
    color: '#f05858',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  controls: { flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', width: 200, bottom: 40, alignSelf: 'center', marginBottom: 20 },
});

export default ReproductionModal;
