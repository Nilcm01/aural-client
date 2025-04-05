import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ReproductionModal from './reproductionModal';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify: any;
    }
}

type TrackType = {
    name: string;
    album: {
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

    const openReproductionModal = () => {
        setReproductionBarVisible(true);
    };

    useEffect(() => {
        if (!player) return;
      
        const interval = setInterval(async () => {
          const state = await player.getCurrentState();
          if (state) {
            setCurrentPosition(state.position);
            setDuration(state.duration);
          }
        }, 1000); // actualiza cada segundo
      
        return () => clearInterval(interval);
      }, [player]);
      

    useEffect(() => {
        if (!token) {
            console.log("Waiting for token...");
            return;
        }

        console.log("Token retrieved, initializing Spotify SDK...");

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (!window.Spotify) {
                console.error('Spotify SDK not available.');
                return;
            }

            window.onSpotifyWebPlaybackSDKReady = () => {
                const spotifyPlayer = new window.Spotify.Player({
                    name: 'Web Playback SDK',
                    getOAuthToken: (cb: (token: string) => void) => cb(token),
                    volume: 0.5
                });

                setPlayer(spotifyPlayer);

                spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
                    console.log('Player ready with Device ID:', device_id);
                    setDeviceId(device_id);

                    //  Transfer playback from web device to Web Playback SDK
                    fetch('https://api.spotify.com/v1/me/player', {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            device_ids: [device_id],
                            play: true,
                        }),
                    }).then((res) => {
                        if (res.ok) {
                            console.log("Playback transfered to SDK succesfully.");
                        } else {
                            console.error("Error transfering Playback", res.status);
                        }
                    });
                });

                spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                    console.log('Device disconnected:', device_id);
                });

                spotifyPlayer.connect().then((success: boolean) => {
                    if (success) {
                        console.log('Connected to Spotify successfully.');
                        setConnected(true);
                    } else {
                        console.error('Error connecting to Spotify.');
                        setConnected(false);
                    }
                });

                //  Obtain state of the reproduction & actual track
                spotifyPlayer.addListener('player_state_changed', (state: any) => {
                    if (!state) return;

                    setTrack(state.track_window.current_track);
                    setPaused(state.paused);

                    console.log('Track actual:', state.track_window.current_track);
                    setLoading(false);

                    const trackInfo = {
                        id: state.track_window.current_track.id,
                        name: state.track_window.current_track.name,
                        artist: state.track_window.current_track.artists[0].name,
                        album: state.track_window.current_track.album.name,
                        image: state.track_window.current_track.album.images[0].url,
                        uri: state.track_window.current_track.uri,
                    };

                    setInfo([trackInfo]); // Update the info state with the track information

                    // Verify if reproduction is active
                    spotifyPlayer.getCurrentState().then((state: any) => {
                        if (!state) {
                            setActive(false);
                            console.log("Reproduction inactive.");
                        } else {
                            setActive(true);
                            console.log("Reproduction active.");
                        }
                    });
                });
            };
        };

    }, [token]);

    if (!token) {
        console.log("Loading Spotify Player...");
    }

    return (
        <View style={[ !loading ? styles.container : styles.loading]}>
            { !loading && 
            <TouchableOpacity onPress={openReproductionModal}>
                <View style={styles.mainWrapper}>
                    {currentTrack.album.images[0].url !== '' && (
                        <Image
                            source={{ uri: currentTrack.album.images[0].url }}
                            style={styles.cover}
                        />
                    )}
                    <View style={styles.info}>
                        <Text style={styles.trackName}>{currentTrack.name}</Text>
                        <Text style={styles.artistName}>{currentTrack.artists[0].name}</Text>
                    </View>
                    
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={() => player?.previousTrack()}>
                                <MaterialIcons name="skip-previous" size={20} color="white"></MaterialIcons>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => player?.togglePlay()}>
                                {isPaused?  <MaterialIcons name="play-arrow" size={20} color="white"></MaterialIcons> : <MaterialIcons name="pause" size={20} color="white"></MaterialIcons>  }
                                {/* When the user is not logged in, song reproduction not available */}
                                {/* Disable play for non-premium users, ToDo */}
                                {/* <MaterialIcons name="play-disabled" size={20} color="white"></MaterialIcons> */}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => player?.nextTrack()}>
                                <MaterialIcons name="skip-next" size={20} color="white"></MaterialIcons>
                            </TouchableOpacity>
                        </View>
                        
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
            </TouchableOpacity> }

            {reproductionBarVisible && (
                <ReproductionModal
                    info= {info}
                    visible={reproductionBarVisible}
                    onClose={() => setReproductionBarVisible(false)}
                    onReload={() => {
                        console.log("Reloading reproduction information...");
                    }}
                />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {marginLeft: 10, paddingTop: 5,paddingBottom: 5, paddingLeft: 4, paddingRight:0, margin: 4, width: 450, height: 60, backgroundColor: '#262626', zIndex: 10, position: 'absolute', bottom: 120, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    loading: { display: "none"},
    mainWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 10},
    cover: { width: 40, height: 40, borderRadius: 10 },
    info: { marginLeft: 15 },
    trackName: { fontSize: 16, fontWeight: 'bold', color: "#FFFFFF" },
    artistName: { fontSize: 12, color: 'gray' },
    controls: { flexDirection: 'row', justifyContent: 'space-around', left: 340, position: 'absolute', width: 100 },
    button: { fontSize: 10, padding: 10, backgroundColor: '#1DB954', color: 'white', borderRadius: 5 }
});

export default WebPlayback;
