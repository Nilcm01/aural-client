import { MaterialIcons, Ionicons, AntDesign, Feather } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
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
import { useSharing } from './../context/SharingContext';
import { useNavigation } from 'expo-router';

export interface TrackInfo {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
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

const API_URL = 'https://aural-454910.ew.r.appspot.com/api/items/';

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

  const navigation = useNavigation<any>();

  //console.log("ReproductionModal rendered, visible:", visible);
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

  //// ACTIONS
  // Share
  const { linkCreate } = useSharing();
  const shareLink = () => {
    const link = linkCreate('song', info[0].id);
    console.log("Sharing link:", link);
    // Copy the link to the clipboard
    Clipboard.setString(link);
  };
  const shareAlbumLink = async () => {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${info[0].id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token?.access_token}`
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch track data`);
    const data = await response.json();

    const link = linkCreate('album', data.album.id);
    console.log("Sharing album link:", link);
    // Copy the link to the clipboard
    Clipboard.setString(link);
  };
  const shareArtistLink = async () => {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${info[0].id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token?.access_token}`
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch track data`);
    const data = await response.json();

    const link = linkCreate('artist', data.artists[0].id);
    console.log("Sharing album link:", link);
    // Copy the link to the clipboard
    Clipboard.setString(link);
  };

  const goToAlbum = async () => {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${info[0].id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token?.access_token}`
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch track data`);
    const data = await response.json();

    navigation.navigate("checkAlbumInfo/[id]", {
      id: data.album.id,
      name: data.album.name,
    });
    setShowOtherActionsModal(false);
    onClose();
  };

  const goToArtist = async () => {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${info[0].id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token?.access_token}`
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch track data`);
    const data = await response.json();

    navigation.navigate("checkArtistInfo/[id]", {
      id: data.artists[0].id,
      name: data.artists[0].name,
    });
    setShowOtherActionsModal(false);
    onClose();
  };

  //// COMMENTS AND RATING
  // Define comment interface
  interface Comment {
    _id: string;
    userId: string;
    content: string;
    entityType: string;
    contentId: string;
    date: string;
  }

  // State for rating and comments modal visibility
  const [showComsAndRatingModal, setShowComsAndRatingModal] = useState(false);
  const [showOtherActionsModal, setShowOtherActionsModal] = useState(false);
  const { token } = useToken();
  const track = info[0];  // info[id]
  const userId = token?.user_id // user id
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // useEffect to load past ratings and comments
  useEffect(() => {
    const getRating = async () => {
      if (track && token) {
        try {
          const response = await fetch(`${API_URL}punctuations-by-entity?entityId=${track.id}&entityType=song`);

          if (response.status === 200) {
            const result = await response.json();
            setRating(result.averageScore)
            console.log('Rating fetched successfully:', result.averageScore);
          } else {
            console.error("Failed getting rating from api:", response.status, response.statusText);
            setErrorMessage("Failed to load rating.");
          }

        } catch (error) {
          console.error("Error fetching rating:", error);
        }
      }
    };

    const getRecentComments = async () => {
      if (track && token) {
        try {
          const response = await fetch(`${API_URL}comments-by-entity?contentId=${track.id}&entityType=song`);

          if (response.status === 200) {
            const result = await response.json();
            setRecentComments(result.reverse());
            console.log("Recent Comments fetched successfully:", result);
          } else {
            console.error("Failed getting recent comments from api:", response.status, response.statusText);
            setErrorMessage("Failed to load comments.");
          }

        } catch (error) {
          console.error("Error fetching recent comments:", error);
        }
      }
    };

    getRating();
    getRecentComments();
  }, [token, track]);

  // Function to handle the submission of a star rating
  const handleRateSubmit = async () => {
    // Checking that there's a rating
    if (rating > 0) {
      try {
        // API call in order to do a rating
        const response = await fetch(API_URL + 'create-punctuation', {
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
        const response = await fetch(API_URL + 'create-comment', {
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
              <TouchableOpacity onPress={() => setShowOtherActionsModal(true)}>
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
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.trackName}>{track.name}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.trackAlbum}>{track.album}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.trackArtist}>{track.artist}</Text>
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
          //onReload={() => { console.log("Reloading queue information..."); }}
          queue={queue}
          onRemoveItem={onRemoveItem}
          onClearQueue={onClearQueue}
          onSkip={() => player?.nextTrack()}
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
                <Text style={styles.comsAndRatingTitle}>Your rating for this song</Text>
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
                <Text style={styles.comsAndRatingTitle}>Comments</Text>
                <View style={styles.separator} />
                {recentComments.length > 0 ? (
                  <FlatList
                    data={recentComments}
                    renderItem={({ item }) => (
                      <View>
                        <Text style={styles.commentText}>{item.content}</Text>
                        <View style={styles.separator} />
                      </View>
                    )}
                    keyExtractor={(item) => item._id}
                  />
                ) : (
                  <Text style={styles.emptyComments}>No comments available.</Text> // Display a message if no comments
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Other actions */}
      {showOtherActionsModal && (
        <Modal visible={showOtherActionsModal} transparent animationType="slide" onRequestClose={() => setShowOtherActionsModal(false)}>
          <View style={styles.otherActionsModalOverlay}>
            <View style={styles.otherActionsModalContent}>

              {/* Close button */}
              <View style={styles.otherActionsCloseButton}>
                <TouchableOpacity onPress={() => setShowOtherActionsModal(false)}>
                  <MaterialIcons name="close" size={30} color="#f05858" />
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>Actions</Text>

              <TouchableOpacity onPress={() => {/* Add to library */ }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Add to Library</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {/* Add to playlist */ }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Add to Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {/* Start session */ }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Start a Session</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={async () => { goToAlbum(); }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Go to Album</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={async () => { goToArtist(); } } style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Go to Artist</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { shareLink(); setShowOtherActionsModal(false); }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Copy this song's link</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={async () => { await shareAlbumLink(); setShowOtherActionsModal(false); }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Copy this song's album link</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { shareArtistLink(); setShowOtherActionsModal(false); }} style={styles.otherActionsList}>
                <Text style={{ color: 'white', fontSize: 18 }}>Copy this song's artist link</Text>
              </TouchableOpacity>

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
    width: "85%",
    marginHorizontal: "7.5%",
    marginTop: 5
  },
  info: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "85%",
    marginHorizontal: "7.5%",
    rowGap: 10
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
  },
  emptyComments: {
    color: '#f05858',
  },
  otherActionsModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',

  },
  otherActionsModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    maxHeight: '100%',
    backgroundColor: '#262626',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  otherActionsCloseButton: {
    position: 'absolute',
    color: '#f05858',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  otherActionsList: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
});

export default ReproductionModal;
