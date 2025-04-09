import React, { useEffect, useState } from 'react';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ReproductionModal from './reproductionModal';

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
    const [queue, setQueue] = useState<any[]>([]); // State to hold the queue

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
                setShuffle(newState); // Update shuffle state
            } else {
                console.error("Error setting shuffle:", res.status);
            }
        } catch (error) {
            console.error("Error setting shuffle:", error);
        }
    };

    const toggleRepeat = async () => {
        const newState = isOnRepeat ? 'off' : 'track'; // o 'context' si prefieres repetir la playlist
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
                setRepeat(newState === 'off' ? 0 : 1); // actualiza el estado local
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

    //console.log("Token in WebPlayback:", token);


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
        if (!currentTrack || !currentTrack.name) return;

        // Convert the currentTrack to the format expected by ReproductionModal
        const trackInfo = {
            id: currentTrack.id || Date.now().toString(), // Fallback ID if not available
            name: currentTrack.name,
            artist: currentTrack.artists[0]?.name || 'Unknown Artist',
            album: currentTrack.album?.name || 'Unknown Album',
            image: currentTrack.album?.images[0]?.url || '',
            uri: currentTrack.uri || ''
        };

        setInfo([trackInfo]); // Replace the current info with this track
    }, [currentTrack]);

    // Initialize the Spotify Web Playback SDK
    useEffect(() => {
        const initPlayer = async () => {
            console.log("Token retrieved, initializing Spotify SDK...");

            // Define the callback function before loading the script
            window.onSpotifyWebPlaybackSDKReady = () => {
                console.log("Spotify SDK is ready");

                if (!token) {
                    console.error("No token available when SDK loaded");
                    return;
                }

                const spotifyPlayer = new window.Spotify.Player({
                    name: 'Aural',
                    getOAuthToken: (cb: (token: string) => void) => cb(token as string),
                    volume: 0.5
                });

                // Set up all player event listeners
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

                    // Transfer playback to this device
                    if (token) {
                        transferPlaybackHere(device_id, token);
                    }
                });

                spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                    console.log('Device has gone offline:', device_id);
                    setConnected(false);
                });

                spotifyPlayer.addListener('player_state_changed', (state: any) => {
                    if (!state) {
                        return;
                    }

                    setTrack(state.track_window.current_track);
                    setPaused(state.paused);
                    setActive(true);

                    // Update position and duration
                    setCurrentPosition(state.position);
                    setDuration(state.duration);
                });

                setPlayer(spotifyPlayer);

                // Connect to the player!
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

            // Create and load the script
            const script = document.createElement('script');
            script.id = 'spotify-player';
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            document.body.appendChild(script);
        };

        // Add this new function to transfer playback
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
                        play: false // Don't autoplay
                    })
                });
                console.log('Transferred playback to current device');
            } catch (error) {
                console.error('Error transferring playback:', error);
            }
        };

        if (token === undefined || token === null || token === '') {
            console.log("Waiting for token...");
            return;
        }

        initPlayer();

        return () => {
            // Cleanup function
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
            {
                <TouchableOpacity onPress={openReproductionModal} style={styles.layout}>
                    <View style={styles.mainWrapper}>
                        <View style={styles.innerBar}>
                            {currentTrack.album.images[0].url !== '' && (
                                <Image
                                    source={{ uri: currentTrack.album.images[0].url }}
                                    style={styles.cover}
                                />
                            )}
                            <View style={styles.info}>
                                <Text style={styles.trackName}>{currentTrack.name ? currentTrack.name : 'No music playing'}</Text>
                                <Text style={styles.artistName}>{currentTrack.artists[0].name ? currentTrack.artists[0].name : ''}</Text>
                            </View>
                        </View>
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={() => player?.togglePlay()}>
                                {isPaused ? 
                                <MaterialIcons name="play-circle-outline" size={40} color="white"></MaterialIcons> : 
                                <MaterialIcons name="pause-circle-outline" size={40} color="white"></MaterialIcons>}
                                {/* When the user is not logged in, song reproduction not available */}
                                {/* Disable play for non-premium users, ToDo */}
                                {/* <MaterialIcons name="play-disabled" size={20} color="white"></MaterialIcons> */}
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={{ height: 4, backgroundColor: 'gray', width: '100%', marginTop: 0, borderRadius: 0 }}>
                        <View
                            style={{
                                height: 4,
                                backgroundColor: '#F05858',
                                width: `${(currentPosition / duration) * 100}%`,
                            }}
                        />
                    </View>
                </TouchableOpacity>}

            {reproductionBarVisible && (
                <ReproductionModal
                    token={token}
                    info={info}
                    visible={reproductionBarVisible}
                    onClose={() => setReproductionBarVisible(false)}
                    onReload={() => {
                        console.log("Reloading reproduction information...");
                        // Update info again from current track if needed
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
                    queue={queue}
                    duration={duration}
                    isShuffle={isShuffle}
                    toggleShuffle={toggleShuffle}
                    isOnRepeat={isOnRepeat}
                    toggleRepeat={toggleRepeat}
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
        display: "flex",
        flexDirection: "row",
    },
    layout: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        height: "100%",
    },
    mainWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 0,
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        rowGap: 5
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
        width: 'auto',
        marginLeft: 'auto',
        marginRight: 20,
    },
    button: {
        fontSize: 10,
        padding: 10,
        backgroundColor: '#1DB954',
        color: 'white',
        borderRadius: 5

    }
});

export default WebPlayback;