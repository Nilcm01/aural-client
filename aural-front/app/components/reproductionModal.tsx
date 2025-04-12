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
  TextInput,
  Button,
} from 'react-native';
import QueueModal from './QueueModal';
import { useToken } from "./../context/TokenContext";

export interface TrackInfo {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  uri: string;
}

interface ReproductionModalProps {
  tokenSpotify: string | null;
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
  tokenSpotify,
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

  //// COMMENTS AND RATING
  // State for rating and comments modal visibility
  const [showComsAndRatingModal, setShowComsAndRatingModal] = useState(false);
  const { token } = useToken();
  const track = info[0];  // info[id]
  const userId = token?.user_id // user id
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // useEffect to load past ratings STILL NEED IMPLEMENTATION
  useEffect(() => {
    const getRating = async () => {
      if (track && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/items/punctuations-by-entity?entityId=${track.id}&entityType=song`);
          const result = await response.json();
  
          
        } catch (error) {
          console.error("Error fetching rating:", error);
        }
      }
    };

    const getRecentComments = async () => {
      if (track && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/items/comments-by-entity?contentId=${track.id}&entityType=song`);
          const result = await response.json();

        } catch (error) {
          console.error("Error fetching recent comments:", error);
        }
      }
    };
  
    getRating();
    getRecentComments;
  }, [token, track]);  

  // Function to handle the submission of a star rating
  const handleRateSubmit = async () => {
    // Checking that there's a rating
    if (rating > 0) {
      try {
        // API call in order to do a rating
        const response = await fetch('http://localhost:5000/api/items/create-punctuation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            entityType: 'song',
            score: rating,
            entityId: track.id,
            date: new Date().toISOString(),
          }),
        });

        const textResponse = await response.text(); // Raw response as text

        // Check if the response is a success message or an error
        if (response.ok) {
          console.log("Rating submitted successfully", textResponse);
          setShowComsAndRatingModal(false);
        } else {
          console.error("Failed to submit rating:", textResponse);
        }

      } catch (error) {
        console.error("Error submitting rating:", error);
        setErrorMessage("Not able to submit rating");
      }
    } else {
      console.log("No rating selected");
      setErrorMessage("Please select a rating before submitting.");
    }
  };

  // Function to handle the submission of a comment 
  const handleCommentSubmit = async () => { 
    // Checking that there's a comment
    if (comment.trim()) {
      try {
        // API call in order to do a comment
        const response = await fetch('http://localhost:5000/api/items/create-comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            entityType: 'song',
            content: comment,
            contentId: track.id,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log("Comment submitted successfully", result);
          setShowComsAndRatingModal(false);
          setComment('');  // Clear comment
        } else {
          console.error("Failed to submit comment:", result);
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
        setErrorMessage("Not able to submit the comment.");
      }
    } else {
      console.log("No comment entered");
      setErrorMessage("Please write a comment before submitting.");
    }
  };
  ////

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
            <TouchableOpacity onPress={() => setShowComsAndRatingModal(true)}>
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
          token={tokenSpotify}
          visible={queueVisible}
          onClose={() => setQueueVisible(false)}
          onReload={() => { console.log("Reloading queue information..."); }}
          queue={queue}
          onRemoveItem={onRemoveItem}
          onClearQueue={onClearQueue}
          onSkip={() => { /* Puedes definir aquí alguna acción para saltar la pista */ }}
        />
      )}

      {/* Comments and Rating Modal */}
      {showComsAndRatingModal && (
        <Modal visible={showComsAndRatingModal} transparent animationType="slide" onRequestClose={() => setShowComsAndRatingModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Ratings and Comments</Text>

              {/* Close button */}
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity onPress={() => setShowComsAndRatingModal(false)}>
                  <MaterialIcons name="close" size={30} color="#f05858" />
                </TouchableOpacity>
              </View>

              {/* Rating section */}
              <View style={styles.ratingContainer}>
                <Text style={styles.comsAndRatingTitle}>Rate this song</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <MaterialIcons name={star <= rating ? 'star' : 'star-border'} size={25} color="#F05858" />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.submitRateButton} onPress={handleRateSubmit}>
                  <MaterialIcons name="check" size={15} color="white" />
                </TouchableOpacity>
              </View>

              {/* Comment input section */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Write your comment here..."
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity style={styles.submitComsButton} onPress={handleCommentSubmit}>
                  <MaterialIcons name="send" size={15} color="white" />
                </TouchableOpacity>
              </View>

              {/* Display recent comments */}
              <View style={styles.recentCommentsSection}>
                <Text style={styles.comsAndRatingTitle}>Recent Comments</Text>
                <View style={styles.separator} />
                <FlatList
                  data={['Great song!', 'Loved it!', 'Amazing beat!']}
                  renderItem={({ item }) => (
                    <View>
                      <Text style={styles.commentText}>{item}</Text>
                      <View style={styles.separator} />
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </View>
          </View>
        </Modal>
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
  // Comments And Rating styles
  comsAndRatingTitle: {
    color: '#f05858',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    color: '#f05858',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  starsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  submitRateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  commentInputContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentInput: {
    height: 80,
    color: '#fff',
    backgroundColor: '#333',
    paddingTop: 5,
    paddingLeft: 10,
    borderRadius: 5,
    width: '80%',
  },
  submitComsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  recentCommentsSection: {
    marginLeft: '10%',
    width: '80%',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  commentText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  }
});

export default ReproductionModal;
