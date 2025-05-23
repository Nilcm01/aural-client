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
    Dimensions,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { useToken } from '../context/TokenContext';
import { useNavigation } from 'expo-router';
import { usePlayContent } from './WebPlayback';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSharing } from '../context/SharingContext';

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
    public: boolean;
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

type SavedType = true | false | 'own';

const LIST_LENGTH = 50;

const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ id, name, onBack }) => {
    const { token } = useToken();
    const navigation = useNavigation<any>();
    const { playContent } = usePlayContent();
    const { linkCreate } = useSharing();

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [saved, setSaved] = useState<SavedType>(false);

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
                const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
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

                console.log(playlistData);

                const pl: PlaylistDetail = {
                    id: playlistData.id,
                    name: playlistData.name,
                    description: playlistData.description,
                    num_tracks: playlistData.tracks.total,
                    public: playlistData.public,
                    images: playlistData.images,
                    owner: {
                        name: playlistData.owner.display_name,
                        id: playlistData.owner.id,
                    }
                };

                setPlaylist(pl);
                if (playlistData.owner.id === token?.user_id) setSaved('own');
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

        // Check if the playlist is saved
        (async () => {
            try {
                // fetch
                const savedRes = await fetch(`https://api.spotify.com/v1/playlists/${id}/followers/contains`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json",
                    }
                });

                // check for error in return
                if (!savedRes.ok) {
                    setError('Failed to get saved status.');
                    throw new Error('Spotify API error: ' + `${savedRes.status} ${savedRes.statusText}`);
                }

                const savedData = await savedRes.json();

                setSaved(savedData[0]);

                //setError('');
            } catch (e) {
                console.error(`Error fetching saved status: ${e}`);
                setError('Failed to load playlist data.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, token]);

    const handleSavePlaylist = async () => {
        if (!id || !token?.access_token || saved === 'own') return;

        if (!saved) /* Not saved -> save */ {
            try {
                const resSave = await fetch(`https://api.spotify.com/v1/playlists/${playlist!.id}/followers`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json",
                    }
                });

                if (!resSave.ok) {
                    throw new Error('Spotify API error: ' + `${resSave.status} ${resSave.statusText}`);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setSaved(true);
                console.log('Playlist saved to library');
            }
        } else /* Saved -> remove */ {
            try {
                const resDelete = await fetch(`https://api.spotify.com/v1/playlists/${playlist!.id}/followers`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json",
                    }
                });

                if (!resDelete.ok) {
                    throw new Error('Spotify API error: ' + `${resDelete.status} ${resDelete.statusText}`);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setSaved(false);
                console.log('Playlist removed from library');
            }
        }
    };

    //// Actions

    const [showActions, setShowActions] = useState(false);
    const [newName, setNewName] = useState(playlist?.name);
    const [newDescription, setNewDescription] = useState(playlist?.description);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (showActions && playlist) {
            setNewName(playlist.name);
            setNewDescription(playlist.description || '');
        }
    }, [showActions, playlist]);

    const handleEditPlaylist = async () => {
        if (!id || !token?.access_token) return;

        try {
            const resEdit = await fetch(`https://api.spotify.com/v1/playlists/${playlist!.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newName,
                    description: newDescription,
                })
            });

            if (!resEdit.ok) {
                throw new Error('Spotify API error: ' + `${resEdit.status} ${resEdit.statusText}`);
            }

            setNewName(playlist?.name);
            setNewDescription(playlist?.description);
            setPlaylist(
                {
                    name: newName,
                    description: newDescription,
                    id: playlist!.id,
                    num_tracks: playlist!.num_tracks,
                    public: playlist!.public,
                    images: playlist!.images,
                    owner: playlist!.owner,
                } as PlaylistDetail
            );
        } catch (e) {
            console.error(e);
        } finally {
            setShowActions(false);
            setDeleteConfirm(false);
            console.log('Playlist edited');
        }
    };
    const handleDeletePlaylist = async () => {
        if (!id || !token?.access_token) return;

        try {
            const resDelete = await fetch(`https://api.spotify.com/v1/playlists/${playlist!.id}/followers`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    "Content-Type": "application/json",
                }
            });

            if (!resDelete.ok) {
                throw new Error('Spotify API error: ' + `${resDelete.status} ${resDelete.statusText}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setShowActions(false);
            setDeleteConfirm(false);
            console.log('Playlist deleted');
            onBack();
        }
    };


    //// Long press on song action
    const [showSongActions, setShowSongActions] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Track | null>(null);
    const [isSelectedSongSaved, setIsSelectedSongSaved] = useState(false);
    const handleSongLongPress = (song: Track) => {
        setSelectedSong(song);
        getSavedStatus();
        setShowSongActions(true);
    };

    const handleDeleteSong = async (songId: string) => {
        if (!id || !token?.access_token) return;

        try {
            const resDelete = await fetch(`https://api.spotify.com/v1/playlists/${playlist!.id}/tracks`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tracks: [{ uri: `spotify:track:${songId}` }]
                })
            });

            if (!resDelete.ok) {
                throw new Error('Spotify API error: ' + `${resDelete.status} ${resDelete.statusText}`);
            }

            // Remove the song from the local state
            setTracks((prevTracks) => prevTracks.filter((track) => track.id !== songId));
            setSelectedSong(null);
            console.log('Song removed from playlist');
        } catch (e) {
            console.error(e);
        } finally {
            setShowSongActions(false);
        }
    };

    const getSavedStatus = async () => {
        if (!selectedSong || !token?.access_token) return;
        try {
            const res = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${selectedSong.id}`, {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                }
            });
            if (!res.ok) throw new Error();
            const sav = await res.json();
            setIsSelectedSongSaved(sav[0]);
        } catch (e) {
            console.error('Error fetching selected track\'s saved status:', e);
            setSaved(false);
        }
    };

    const handleSaveTrack = async () => {
        if (!selectedSong || !token?.access_token) return;

        if (!isSelectedSongSaved) /* Not saved -> save */ {
            try {
                const resSave = await fetch(`https://api.spotify.com/v1/me/tracks`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: [selectedSong.id] }),
                });

                if (!resSave.ok) {
                    throw new Error('Spotify API error: ' + `${resSave.status} ${resSave.statusText}`);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsSelectedSongSaved(true);
                console.log('Track saved to library');
            }
        } else /* Saved -> remove */ {
            try {
                const resDelete = await fetch(`https://api.spotify.com/v1/me/tracks`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: [selectedSong.id] }),
                });

                if (!resDelete.ok) {
                    throw new Error('Spotify API error: ' + `${resDelete.status} ${resDelete.statusText}`);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsSelectedSongSaved(false);
                console.log('Track removed from library');
            }
        }
    };


    const renderSong = ({ item }: { item: Track }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => playContent(token?.access_token, 'playlist', playlist!.id, item.number + item.offset)}
            onLongPress={() => handleSongLongPress(item)}
            delayLongPress={500}
        >

            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
                <Image
                    style={{ width: 50, height: 50, borderRadius: 4, marginBottom: 'auto' }}
                    source={{ uri: item.album.images[0] ? item.album.images[0].url : 'https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png' }}
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Header */}

            <View style={styles.header}>
                {playlist?.images ?
                    <Image style={styles.image} source={{ uri: playlist?.images[0].url }} /> :
                    <Image style={styles.image} source={{ uri: "https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png" }} />
                }
                <View style={styles.info}>
                    <Text style={styles.name}>{playlist?.name}</Text>
                    <Text style={styles.description}>{playlist?.description}</Text>
                    <Text style={styles.owner}>
                        <Text style={{ color: '#bbbb', fontStyle: 'italic' }}>playlist by: </Text>{playlist?.owner.name}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 40 }}>
                        <TouchableOpacity onPress={() => { handleSavePlaylist(); }}>
                            <MaterialIcons name={
                                (saved === true) ? 'check-circle' :
                                    (saved === 'own') ? 'account-circle' :
                                        'add-circle-outline'
                            } size={32} color="#f05858" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            Clipboard.setString(linkCreate('playlist', playlist!.id));
                        }}>
                            <MaterialIcons name="share" size={24} color="#f05858" />
                        </TouchableOpacity>
                        {(saved === 'own') && (
                            <TouchableOpacity onPress={() => setShowActions(true)}>
                                <SimpleLineIcons name="options" size={24} color="#f05858" />
                            </TouchableOpacity>
                        )}
                    </View>
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

            {/* Actions */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showActions}
                onRequestClose={() => {
                    setShowActions(!showActions);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                    <View style={{ width: '80%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 20, marginBottom: 20 }}>Edit playlist</Text>
                        <TextInput
                            style={{ height: 40, borderColor: '#f05858', borderWidth: 1, borderRadius: 10, marginBottom: 20, color: '#fff', paddingHorizontal: 10 }}
                            editable={true}
                            placeholder="Playlist name"
                            placeholderTextColor="#bbb"
                            onChangeText={(text) => setNewName(text)}
                            value={newName}
                        />
                        <TextInput
                            style={{ height: 40, borderColor: '#f05858', borderWidth: 1, borderRadius: 10, marginBottom: 20, color: '#fff', paddingHorizontal: 10 }}
                            editable={true}
                            placeholder="Playlist description"
                            placeholderTextColor="#bbb"
                            onChangeText={(text) => setNewDescription(text)}
                            value={newDescription || ''}
                        />
                        <TouchableOpacity
                            style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center' }}
                            onPress={() => {
                                handleEditPlaylist();
                                setShowActions(false);
                                setDeleteConfirm(false);
                            }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Save changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ backgroundColor: '#f05858', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                            onPress={() => {
                                if (deleteConfirm) {
                                    handleDeletePlaylist();
                                    setShowActions(false);
                                } else {
                                    setDeleteConfirm(true);
                                }
                            }}>
                            <Text style={
                                !deleteConfirm ? { color: '#fff', fontSize: 16 } : { color: '#fff', fontSize: 16, fontWeight: 'bold' }
                            }>{
                                    !deleteConfirm ? 'Delete playlist' : 'Confirm delete'
                                }</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ backgroundColor: 'gray', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                            onPress={() => { setShowActions(false); setDeleteConfirm(false); }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Song actions */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSongActions}
                onRequestClose={() => {
                    setShowSongActions(false);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                    <View style={{ width: '80%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 20 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
                            <Image
                                style={{ width: 50, height: 50, borderRadius: 4, marginBottom: 'auto' }}
                                source={{ uri: selectedSong?.album.images ? selectedSong?.album.images[0].url : 'https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png' }}
                            />
                            <View style={{}}>
                                <Text style={styles.songText}>{selectedSong?.name}</Text>
                                {selectedSong?.artists.map((artist, i) => (
                                    <Text key={artist.id} style={styles.songArtist}>
                                        <TouchableOpacity onPress={() => { }}>
                                            <Text style={{ color: '#f05858' }}>{artist.name}</Text>
                                        </TouchableOpacity>{i < selectedSong?.artists.length - 1 ? ', ' : ''}
                                    </Text>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={{ backgroundColor: isSelectedSongSaved ? '#f05858' : '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                            onPress={() => handleSaveTrack()}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>{
                                isSelectedSongSaved ? 'Remove from library' : 'Save to library'
                            }</Text>
                        </TouchableOpacity>
                        {(saved === 'own') && (
                            <TouchableOpacity
                                style={{ backgroundColor: '#f05858', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                                onPress={() => handleDeleteSong(selectedSong!.id)}>
                                <Text style={{ color: '#fff', fontSize: 16 }}>Remove from playlist</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={{ backgroundColor: 'gray', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                            onPress={() => { setShowSongActions(false); setSelectedSong(null); }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 10,
        zIndex: 50,
        paddingBottom: 10,
    },
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
        flexWrap: 'wrap',
        maxWidth: Dimensions.get('window').width * 0.55,
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
