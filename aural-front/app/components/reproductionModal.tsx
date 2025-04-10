import { MaterialIcons, Ionicons, AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
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
  token: string | null;
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
  onRemoveItem: (id: string) => void;  // Agregado
  onClearQueue: () => void;           // Agregado
}

const ReproductionModal: React.FC<ReproductionModalProps> = ({
  token,
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
  queue,
  onRemoveItem,
  onClearQueue,
}) => {
  // Llama a onReload cuando el modal se abra
  useEffect(() => {
    if (visible) {
      onReload();
    }
  }, [visible]);

  console.log("ReproductionModal rendered, visible:", visible);
  const [queueVisible, setQueueVisible] = useState(false);

  const openQueueModal = () => {
    setQueueVisible(true);
  };

  // Helper function to format milliseconds to mm:ss
  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || isNaN(milliseconds)) return "0:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
            <View style={styles.topBar}>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="arrow-back-ios" size={35} color="white" style={{ left: 0 }} />
              </TouchableOpacity>
              <Text style={styles.title}>Now listening</Text>
              <TouchableOpacity onPress={() => {/* Open options modal */ }}>
                <MaterialIcons name="menu" size={40} color="white" style={{ left: 0 }} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
              {info.map((track) => (
                <View key={track.id} style={{ alignItems: 'center', margin: 10 }}>
                  <Image source={{ uri: track.image }} style={styles.cover} />
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => {/* Add to library */ }}>
                      <MaterialIcons name="add-circle-outline" size={40} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {/* Show lyrics */ }}>
                      <MaterialIcons name="text-fields" size={40} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.trackName}>{track.name}</Text>
                    <Text style={styles.trackAlbum}>{track.album}</Text>
                    <Text style={styles.trackArtist}>{track.artist}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.progressBarContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Text style={{ color: 'white', fontSize: 12 }}>{formatTime(currentPosition)}</Text>
                <Text style={{ color: 'white', fontSize: 12 }}>{formatTime(duration)}</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={{
                    height: 4,
                    backgroundColor: '#F05858',
                    width: `${(currentPosition / duration) * 100}%`,
                  }}
                />
              </View>
            </View>

            <View style={styles.controls1}>
              <TouchableOpacity onPress={() => player?.previousTrack()}>
                <MaterialIcons name="skip-previous" size={70} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => player?.togglePlay()}>
                {isPaused ?
                  <MaterialIcons name="play-circle-outline" size={100} color="white" /> :
                  <MaterialIcons name="pause-circle-outline" size={100} color="white" />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => player?.nextTrack()}>
                <MaterialIcons name="skip-next" size={70} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.controls2}>
              <TouchableOpacity onPress={toggleShuffle}>
                <Ionicons name="chatbubble-outline" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleShuffle}>
                <MaterialIcons name="shuffle" size={30} color={isShuffle ? "#f05858" : "white"} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleRepeat}>
                <MaterialIcons name="repeat" size={30} color={isOnRepeat ? "#f05858" : "white"} />
              </TouchableOpacity>

              <TouchableOpacity onPress={openQueueModal}>
                <MaterialIcons name="format-list-bulleted" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Queue Modal */}
      {queueVisible && (
        <QueueModal
          token={token}
          visible={queueVisible}
          onClose={() => setQueueVisible(false)}
          onReload={() => { console.log("Reloading queue information..."); }}
          queue={queue}
          onRemoveItem={onRemoveItem}
          onClearQueue={onClearQueue}
          onSkip={() => { /* Puedes definir aquí alguna acción para saltar la pista */ }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    maxHeight: '100%',
    maxWidth: '100%',
    borderRadius: 0
  },
  modalContent: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    height: '100%',
    backgroundColor: '#262626',
    borderRadius: 0,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 22,
    color: '#f05858',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cover: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    maxHeight: Dimensions.get('window').height < 750
      ? Dimensions.get('window').width * 0.5
      : Dimensions.get('window').height < 850
        ? Dimensions.get('window').width * 0.6
        : Dimensions.get('window').width * 0.8,
    resizeMode: 'contain'
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5
  },
  info: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    rowGap: 10,
  },
  trackName: {
    fontWeight: "bold",
    fontSize: 24,
    color: "white",
    marginTop: 10
  },
  trackAlbum: {
    fontSize: 20,
    color: "white",
    fontStyle: "italic"
  },
  trackArtist: {
    fontSize: 20,
    color: "white"
  },
  progressBarContainer: {
    marginTop: 10,
    width: '85%',
    marginHorizontal: '7.5%',
    alignItems: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'gray',
    width: '100%',
  },
  controls1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "80%",
    marginHorizontal: '10%',
    marginTop: 20,
    alignSelf: 'center',
  },
  controls2: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "80%",
    marginHorizontal: '10%',
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default ReproductionModal;
