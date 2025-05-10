import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useToken } from '../context/TokenContext';
import { useNavigation } from 'expo-router';
import { usePlayContent } from './WebPlayback';

interface PlaylistInfoProps {
    id: string;
    name: string;
    onBack: () => void;
}

interface PlaylistDetail {
    id: string,
    name: string;
    description: string | null;
    num_tracks: number;
    images: {
        url: string;
    }[];
    owner: {
        name: string;
        id: string;
    };
}

interface Track {
    id: string;
    name: string;
    duration_ms: number;
    number: number;
    offset: number;
    artists: {
        id: string;
        name: string;
    }[];
    album: {
        id: string,
        name: string;
        images: { url: string }[];
        release_date: string
    };
}



const LIST_LENGTH = 50;

const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ id, name, onBack }) => {
    const { token } = useToken();
    const navigation = useNavigation<any>();
    const { playContent } = usePlayContent();

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const addTracks = (tracks: Track[]) => {
        setTracks((prevTracks) => [...prevTracks, ...tracks]);
    };

    // Helper function to format milliseconds to mm:ss
    const formatTime = (milliseconds: number): string => {
        if (!milliseconds || isNaN(milliseconds)) return "0:00";

        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Fetch playlist metadata and tracks
    useEffect(() => {
        if (!id || !token?.access_token) return;
        setLoading(true);

        // Playlist data
        (async () => {
            try {
                // fetch
                const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${id}?fields=description,id,images,name,owner,tracks`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json",
                    }
                });

                // check for error in return
                if (!playlistRes.ok) {
                    setError('Failed to load playlist data.');
                    throw new Error('Spotify API error: ' + `${playlistRes.status} ${playlistRes.statusText}`);
                }

                const playlistData = await playlistRes.json();

                const pl: PlaylistDetail = {
                    id: playlistData.id,
                    name: playlistData.name,
                    description: playlistData.description,
                    num_tracks: playlistData.tracks.total,
                    images: playlistData.images,
                    owner: {
                        name: playlistData.owner.display_name,
                        id: playlistData.owner.id,
                    }
                };

                setPlaylist(pl);
                //setError('');
            } catch (e) {
                console.error(`Error fetching playlist data: ${e}`);
                setError('Failed to load playlist data.');
            } finally {
                setLoading(false);
            }
        })();

        // Tracks data
        (async () => {
            try {
                let offset = 0;
                let hasMoreTracks = true;

                while (hasMoreTracks) {
                    // fetch
                    const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=${LIST_LENGTH}&offset=${offset}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token.access_token}`,
                            "Content-Type": "application/json",
                        }
                    });

                    // check for error in return
                    if (!tracksRes.ok) {
                        setError('Failed to load playlist data.');
                        throw new Error('Spotify API error: ' + `${tracksRes.status} ${tracksRes.statusText}`);
                    }

                    const tracksData = await tracksRes.json();

                    const tr: Track[] = tracksData.items.map((item: any, i: number) => ({
                        id: item.track.id,
                        name: item.track.name,
                        duration_ms: item.track.duration_ms,
                        number: i,
                        offset: offset,
                        artists: item.track.artists.map((artist: any) => ({
                            id: artist.id,
                            name: artist.name,
                        })),
                        album: {
                            id: item.track.album.id,
                            name: item.track.album.name,
                            images: item.track.album.images,
                            release_date: item.track.album.release_date
                        }
                    }));

                    // First batch of tracks - set directly, others add to existing
                    if (offset === 0) {
                        setTracks(tr);
                    } else {
                        addTracks(tr);
                    }

                    console.log(`Fetched tracks ${offset} to ${offset + tr.length}`);

                    // Check if there are more tracks to fetch
                    if (tracksData.next) {
                        offset += LIST_LENGTH;
                    } else {
                        hasMoreTracks = false;
                    }
                }
            } catch (e) {
                console.error(`Error fetching playlist data: ${e}`);
                setError('Failed to load playlist data.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, token]);

    const renderSong = ({ item }: { item: Track }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => playContent(token?.access_token, 'playlist', playlist!.id, item.number + item.offset)}>

            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
                <Image
                    style={{ width: 50, height: 50, borderRadius: 4, marginBottom: 'auto' }}
                    source={{ uri: item.album.images[0]?.url }}
                />
                <View style={{}}>
                    <Text style={styles.songText}>{item.name}</Text>
                    {item.artists.map((artist, i) => (
                        <Text key={artist.id} style={styles.songArtist}>
                            <TouchableOpacity onPress={() =>
                                navigation.navigate("checkArtistInfo/[id]", {
                                    id: artist.id,
                                    name: artist.name,
                                })
                            }>
                                <Text style={{ color: '#f05858' }}>{artist.name}</Text>
                            </TouchableOpacity>{i < item.artists.length - 1 ? ', ' : ''}
                        </Text>
                    ))}
                </View>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ color: '#ffffff', fontSize: 16 }}>
                    {formatTime(item.duration_ms)}
                </Text>
            </View>


        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#f05858" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Header */}

            <View style={styles.header}>
                {playlist?.images[0]?.url ?
                    <Image style={styles.image} source={{ uri: playlist?.images[0].url }} /> :
                    <Text style={styles.noImg}>No image</Text>
                }
                <View style={styles.info}>
                    <Text style={styles.name}>{playlist?.name}</Text>
                    <Text style={styles.description}>{playlist?.description}</Text>
                    <Text style={styles.owner}>
                        <Text style={{ color: '#bbbb', fontStyle: 'italic' }}>playlist by: </Text>{playlist?.owner.name}
                    </Text>
                </View>
            </View>

            {/* Song list */}

            <View style={styles.list}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.sectionTitle}>Tracks</Text>
                    <TouchableOpacity onPress={() => playContent(token?.access_token, 'playlist', playlist!.id, 0)}>
                        <MaterialIcons name="play-circle-outline" size={42} color="#f05858" />
                    </TouchableOpacity>
                </View>
                <FlatList data={tracks} renderItem={renderSong} keyExtractor={i => i.id} />
            </View>


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 10, zIndex: 50 },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
        zIndex: 1
    },
    error: { color: 'red', textAlign: 'center', marginTop: 50 },
    backButton: { position: 'absolute', top: 10, left: 10, zIndex: 1 },
    header: {
        flexDirection: 'row',
        marginTop: 50,
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        borderColor: '#f05858',
        borderWidth: 0.5
    },
    image: { width: 160, height: 160, borderRadius: 8 },
    noImg: { color: '#fff', fontStyle: 'italic' },
    info: { flex: 1, marginLeft: 20 },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f05858',
        marginBottom: 5
    },
    description: {
        fontSize: 20,
        fontWeight: 'regular',
        color: '#ffffff',
        marginBottom: 5,
        fontStyle: 'italic'
    },
    owner: {
        fontSize: 18,
        color: '#f05858',
        marginBottom: 5,
    },
    //year: { fontSize: 16, color: '#bbb' },
    songItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 10
    },
    songText: {
        color: '#fff',
        fontSize: 18,
    },
    songArtist: {
        color: '#f05858',
        fontSize: 16,
        marginTop: 5,
    },
    list: {
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
        borderColor: '#f05858',
        borderWidth: 0.5
    },
    titleWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f05858', marginBottom: 10 },
});

export default PlaylistInfo;
