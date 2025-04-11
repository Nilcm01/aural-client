import React, { useEffect, useState } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import ReproductionModal from './reproductionModal';
import { useQueue } from '../context/QueueContext'; // Utilizamos el contexto para la cola

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

type TrackType = {
  id?: string;
  name: string;
  uri?: string;
  album: {
    name?: string;
    images: { url: string }[];
  };
  artists: { name: string }[];
};

type Props = {
  token: string | null;
};

const emptyTrack: TrackType = {
  name: '',
  album: {
    images: [{ url: '' }]
  },
  artists: [{ name: '' }]
};

const WebPlayback: React.FC<Props> = ({ token }) => {
  // Usamos el hook del contexto para obtener la cola y sus métodos
  const { queue, removeFromQueue, clearQueue } = useQueue();

  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isConnected, setConnected] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [isActive, setActive] = useState(false);
  const [currentTrack, setTrack] = useState<TrackType>(emptyTrack);
  const [reproductionBarVisible, setReproductionBarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<{ id: string; name: string; artist: string; album: string; image: string; uri: string }[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setShuffle] = useState(false);
  const [isOnRepeat, setRepeat] = useState(0);

  const toggleShuffle = async () => {
    const newState = !isShuffle;
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${newState}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        console.log(`Shuffle ${newState ? "enabled" : "disabled"}`);
        setShuffle(newState);
      } else {
        console.error("Error setting shuffle:", res.status);
      }
    } catch (error) {
      console.error("Error setting shuffle:", error);
    }
  };

  const toggleRepeat = async () => {
    const newState = isOnRepeat ? 'off' : 'track';
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${newState}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        console.log(`Repeat ${newState === 'off' ? 'disabled' : 'enabled'}`);
        setRepeat(newState === 'off' ? 0 : 1);
      } else {
        console.error("Error setting repeat:", res.status);
      }
    } catch (error) {
      console.error("Error setting repeat:", error);
    }
  };

  const openReproductionModal = () => {
    setReproductionBarVisible(true);
  };

  const setQueueTracks = async (uris: string[]) => {
    if (!token || !deviceId) {
      console.error("No token or device ID");
      return;
    }
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: deviceId,
          uris: uris
        })
      });
      if (res.ok) {
        console.log("Playback queue replaced with new tracks.");
      } else {
        console.error("Error replacing queue:", await res.text());
      }
    } catch (error) {
      console.error("Error replacing queue:", error);
    }
  };

  // Actualiza la posición y duración cada segundo
  useEffect(() => {
    if (!player) return;
    const interval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state) {
        setCurrentPosition(state.position);
        setDuration(state.duration);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player]);

  // Actualiza la info del track actual
  useEffect(() => {
    if (!currentTrack || !currentTrack.name) return;
    const trackInfo = {
      id: currentTrack.id || Date.now().toString(),
      name: currentTrack.name,
      artist: currentTrack.artists[0]?.name || 'Unknown Artist',
      album: currentTrack.album?.name || 'Unknown Album',
      image: currentTrack.album?.images[0]?.url || '',
      uri: currentTrack.uri || ''
    };
    setInfo([trackInfo]);
  }, [currentTrack]);

  // Remueve el primer ítem de la cola cuando se empiece a reproducir ese track
  useEffect(() => {
    if (
      queue.length > 0 &&
      currentTrack &&
      currentTrack.id &&
      queue[0].id === currentTrack.id
    ) {
      console.log("Removing first track from queue:", currentTrack.id);
      removeFromQueue(currentTrack.id);
    }
  }, [currentTrack, queue, removeFromQueue]);

  useEffect(() => {
    const initPlayer = async () => {
      console.log("Token retrieved, initializing Spotify SDK...");
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("Spotify SDK is ready");
        if (!token) {
          console.error("No token available when SDK loaded");
          return;
        }
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Aural',
          getOAuthToken: (cb: (token: string) => void) => cb(token as string),
          volume: 0.5,
        });
        spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Initialization error:', message);
        });
        spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Authentication error:', message);
        });
        spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Account error (Premium required):', message);
        });
        spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Playback error:', message);
        });
        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Player ready with device ID:', device_id);
          setDeviceId(device_id);
          setConnected(true);
          setLoading(false);
          if (token) {
            transferPlaybackHere(device_id, token);
          }
        });
        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device has gone offline:', device_id);
          setConnected(false);
        });
        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          setTrack(state.track_window.current_track);
          setPaused(state.paused);
          setActive(true);
          setCurrentPosition(state.position);
          setDuration(state.duration);
        });
        setPlayer(spotifyPlayer);
        spotifyPlayer.connect()
          .then((success: boolean) => {
            if (success) {
              console.log('The Web Playback SDK successfully connected to Spotify!');
            } else {
              console.error('Failed to connect to Spotify');
            }
          })
          .catch((err: any) => {
            console.error('Error connecting to Spotify:', err);
          });
      };

      const script = document.createElement('script');
      script.id = 'spotify-player';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    };

    const transferPlaybackHere = async (deviceId: string, token: string) => {
      try {
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: false
          })
        });
        console.log('Transferred playback to current device');
      } catch (error) {
        console.error('Error transferring playback:', error);
      }
    };

    if (!token) {
      console.log("Waiting for token...");
      return;
    }
    initPlayer();
    return () => {
      if (player) {
        player.disconnect();
      }
      window.onSpotifyWebPlaybackSDKReady = undefined;
      const existingScript = document.getElementById('spotify-player');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [token]);

  if (!token) {
    console.log("Loading Spotify Player...");
  }

  return (
    <View style={[!loading ? styles.container : styles.loading]}>
      <TouchableOpacity onPress={openReproductionModal} style={styles.layout}>
        <View style={styles.mainWrapper}>
          <View style={styles.innerBar}>
            {currentTrack?.album?.images && currentTrack.album.images.length > 0 && (
              <Image
                source={{ uri: currentTrack.album.images[0].url }}
                style={styles.cover}
              />
            )}
            <View style={styles.info}>
              <Text style={styles.trackName}>
                {currentTrack?.name ? currentTrack.name : 'No music playing'}
              </Text>
              <Text style={styles.artistName}>
                {currentTrack?.artists[0]?.name ? currentTrack.artists[0].name : ''}
              </Text>
            </View>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => player?.togglePlay()}>
              {isPaused ? (
                <MaterialIcons name="play-circle-outline" size={40} color="white" />
              ) : (
                <MaterialIcons name="pause-circle-outline" size={40} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View
            style={{
              height: 4,
              backgroundColor: '#F05858',
              width: `${(currentPosition / duration) * 100}%`,
            }}
          />
        </View>
      </TouchableOpacity>

      {reproductionBarVisible && (
        <ReproductionModal
          token={token}
          info={info}
          visible={reproductionBarVisible}
          onClose={() => setReproductionBarVisible(false)}
          onReload={() => {
            console.log("Reloading reproduction information...");
            if (currentTrack && currentTrack.name) {
              const trackInfo = {
                id: currentTrack.id || Date.now().toString(),
                name: currentTrack.name,
                artist: currentTrack.artists[0]?.name || 'Unknown Artist',
                album: currentTrack.album?.name || 'Unknown Album',
                image: currentTrack.album?.images[0]?.url || '',
                uri: currentTrack.uri || ''
              };
              setInfo([trackInfo]);
            }
          }}
          isPaused={isPaused}
          player={player}
          currentPosition={currentPosition}
          queue={queue}  // La cola proviene del contexto
          duration={duration}
          isShuffle={isShuffle}
          toggleShuffle={toggleShuffle}
          isOnRepeat={isOnRepeat}
          toggleRepeat={toggleRepeat}
          onRemoveItem={removeFromQueue}
          onClearQueue={clearQueue}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#262626',
    zIndex: 10,
    position: 'absolute',
    bottom: 79,
    borderRadius: 0,
  },
  loading: {
    display: "none"
  },
  innerBar: {
    flexDirection: "row",
  },
  layout: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    height: "100%",
  },
  mainWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  cover: {
    width: "auto",
    height: 56,
    aspectRatio: 1,
    borderRadius: 0
  },
  info: {
    marginLeft: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#FFFFFF",
    textAlign: 'left'
  },
  artistName: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left'
  },
  controls: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'gray',
    width: '100%',
    marginTop: 0,
    borderRadius: 0,
  },
  button: {
    fontSize: 10,
    padding: 10,
    backgroundColor: '#1DB954',
    color: 'white',
    borderRadius: 5,
  },
});

export default WebPlayback;
