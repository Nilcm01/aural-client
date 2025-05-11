import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { useToken } from "../context/TokenContext";
import { useReproBarVisibility } from "../components/WebPlayback";
import { useFocusEffect, useNavigation } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";

interface Content {
  id: string;
  name: string;
  subname?: string;
  image: string;
};

type ContentType = 'album' | 'artist' | 'playlist';

const LibrariesScreen = () => {
  const { token } = useToken();
  const navigation = useNavigation<any>();
  const { showReproBar } = useReproBarVisibility();
  useFocusEffect(() => {
    showReproBar(true);
    return () => { };
  });

  const [artists, setArtists] = React.useState<Content[]>([]);
  const [albums, setAlbums] = React.useState<Content[]>([]);
  const [playlists, setPlaylists] = React.useState<Content[]>([]);
  const [artistsLoaded, setArtistsLoaded] = React.useState(false);
  const [albumsLoaded, setAlbumsLoaded] = React.useState(false);
  const [playlistsLoaded, setPlaylistsLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = React.useState<ContentType>('artist');

  useEffect(() => {
    if (!token?.access_token) return;

    // Fetch user's followed artists
    (async () => {
      // Empty the artists array
      setArtists([]);
      try {
        let next: string | null = 'https://api.spotify.com/v1/me/following?type=artist&limit=50';

        do {
          // fetch
          const artistsRes: Response = await fetch(next, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "application/json",
            }
          });

          // check for error in return
          if (!artistsRes.ok) {
            setError('Failed to load followed artists.');
            throw new Error('Spotify API error: ' + `${artistsRes.status} ${artistsRes.statusText}`);
          }

          const artistsData = await artistsRes.json();

          const ar: Content[] = artistsData.artists.items.map((item: any, i: number) => ({
            id: item.id,
            name: item.name,
            image: item.images[0]?.url
          }));

          setArtists((prev) => [...prev, ...ar]);
          next = artistsData.artists.next;

        } while (next !== null)
      } catch (e) {
        console.error(`Error fetching followed artists: ${e}`);
        setError('Failed to load followed artists.');
      } finally {
        // Order the artists by name
        setArtists((prev) => prev.sort((a, b) => a.name.localeCompare(b.name)));
        setArtistsLoaded(true);
      }
    })();

    // Fetch user's saved albums
    (async () => {
      // Empty the albums array
      setAlbums([]);
      try {
        let offset = 0;
        let hasMoreAlbums = true;

        while (hasMoreAlbums) {
          // fetch
          const albumsRes = await fetch(`https://api.spotify.com/v1/me/albums?limit=50&offset=${offset}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "application/json",
            }
          });

          // check for error in return
          if (!albumsRes.ok) {
            setError('Failed to load saved albums.');
            throw new Error('Spotify API error: ' + `${albumsRes.status} ${albumsRes.statusText}`);
          }

          const albumsData = await albumsRes.json();

          const al: Content[] = albumsData.items.map((item: any, i: number) => ({
            id: item.album.id,
            name: item.album.name,
            subname: item.album.artists[0].name,
            image: item.album.images[0]?.url
          }));

          setAlbums((prev) => [...prev, ...al]);

          // Check if there are more tracks to fetch
          if (albumsData.next) {
            offset += 50;
          } else {
            hasMoreAlbums = false;
          }
        }
      } catch (e) {
        console.error(`Error fetching saved albums: ${e}`);
        setError('Failed to load saved albums.');
      } finally {
        // Order the albums by name
        setAlbums((prev) => prev.sort((a, b) => a.name.localeCompare(b.name)));
        setAlbumsLoaded(true);
      }
    })();

    // Fetch user's playlists
    (async () => {
      // Empty the albums array
      setAlbums([]);
      try {
        let offset = 0;
        let hasMorePlaylists = true;

        while (hasMorePlaylists) {
          // fetch
          const playlistsRes = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "application/json",
            }
          });

          // check for error in return
          if (!playlistsRes.ok) {
            setError('Failed to load playlists.');
            throw new Error('Spotify API error: ' + `${playlistsRes.status} ${playlistsRes.statusText}`);
          }

          const playlistsData = await playlistsRes.json();

          const al: Content[] = playlistsData.items.map((item: any, i: number) => ({
            id: item.id,
            name: item.name,
            subname: item.owner.display_name,
            image: item.images[0]?.url
          }));

          setPlaylists((prev) => [...prev, ...al]);

          // Check if there are more tracks to fetch
          if (playlistsData.next) {
            offset += 50;
          } else {
            hasMorePlaylists = false;
          }
        }
      } catch (e) {
        console.error(`Error fetching playlists: ${e}`);
        setError('Failed to load playlists.');
      } finally {
        // Order the playlists by name
        setPlaylists((prev) => prev.sort((a, b) => a.name.localeCompare(b.name)));
        setPlaylistsLoaded(true);
      }
    })();

  }, [token]);

  const renderArtist = ({ item }: { item: Content }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() =>
        navigation.navigate("checkArtistInfo/[id]", {
          id: item.id,
          name: item.name,
        })
      }>

      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
        <Image
          style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 'auto' }}
          source={{ uri: item.image }} // Use the image URL from the artist object
        />
        <Text style={{ color: '#ffffff', fontSize: 16 }}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbum = ({ item }: { item: Content }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() =>
        navigation.navigate("checkAlbumInfo/[id]", {
          id: item.id,
          name: item.name,
        })
      }>

      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
        <Image
          style={{ width: 50, height: 50, borderRadius: 2, marginBottom: 'auto' }}
          source={{ uri: item.image }} // Use the image URL from the artist object
        />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5, flexWrap: 'wrap', width: Dimensions.get('window').width * 0.85, }}>
          <Text style={{ color: '#ffffff', fontSize: 16 }}>
            {item.name}
          </Text>
          <Text style={{ color: '#808080', fontSize: 12, fontStyle: 'italic' }}>
            {item.subname ? item.subname : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPlaylist = ({ item }: { item: Content }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() =>
        navigation.navigate("checkPlaylistInfo/[id]", {
          id: item.id,
        })
      }>

      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
        <Image
          style={{ width: 50, height: 50, borderRadius: 2, marginBottom: 'auto' }}
          source={{ uri: item.image }} // Use the image URL from the artist object
        />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5, flexWrap: 'wrap', width: Dimensions.get('window').width * 0.85, }}>
          <Text style={{ color: '#ffffff', fontSize: 16 }}>
            {item.name}
          </Text>
          <Text style={{ color: '#808080', fontSize: 12, fontStyle: 'italic' }}>
            {item.subname ? item.subname : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View className="app-bar" style={{
        height: 80, backgroundColor: "#262626",
        alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
      }}>
        <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
          Library
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#F05858", fontWeight: "regular", fontStyle: "italic", fontSize: 12, marginRight: 10 }}>
            {token ? `${token.user_id}` : "No Token"}
          </Text>
          <MaterialIcons
            name={token ? "person" : "login"} // Show "person" if token exists, otherwise "login"
            size={30}
            color="white"
            onPress={() => {
              if (token) {
                router.push("/profileScreen");
              } else {
                router.push("/loginScreen"); // Navigate to login screen
              }
            }}
          />
          <Ionicons
            name="people-circle-outline"
            size={30}
            color="white"
            onPress={() => {
              if (token) {
                router.push("/FriendsScreen");
              } else {
                router.push("/loginScreen"); // Navigate to login screen
              }
            }}
          />
        </View>
      </View>

      {(!albumsLoaded || !artistsLoaded) && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f05858" />
        </View>
      )}
      {error && (
        <View style={styles.loaderContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <View style={styles.contentSelector}>
        <TouchableOpacity
          onPress={() => { setDisplayedContent('artist'); }}
          style={
            displayedContent === 'artist' ? styles.contentSelectorButtonActive : styles.contentSelectorButton
          }>
          <Text style={
            displayedContent === 'artist' ? styles.contentSelectorTextActive : styles.contentSelectorText
          }>Artists</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setDisplayedContent('album'); }}
          style={
            displayedContent === 'album' ? styles.contentSelectorButtonActive : styles.contentSelectorButton
          }>
          <Text style={
            displayedContent === 'album' ? styles.contentSelectorTextActive : styles.contentSelectorText
          }>Albums</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setDisplayedContent('playlist'); }}
          style={
            displayedContent === 'playlist' ? styles.contentSelectorButtonActive : styles.contentSelectorButton
          }>
          <Text style={
            displayedContent === 'playlist' ? styles.contentSelectorTextActive : styles.contentSelectorText
          }>Playlists</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}>
        <FlatList data={
          displayedContent === 'artist' ? artists :
            displayedContent === 'album' ? albums :
              playlists
        } renderItem={
          displayedContent === 'artist' ? renderArtist :
            displayedContent === 'album' ? renderAlbum :
              renderPlaylist
        } keyExtractor={i => i.id} />
      </ScrollView>

    </View>
  );
}

export default LibrariesScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 140,
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 50
  },
  contentSelector: {
    marginTop: 81,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  contentSelectorButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  contentSelectorText: {
    color: "#fff",
    fontSize: 16,
  },
  contentSelectorButtonActive: {
    backgroundColor: "#f05858",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  contentSelectorTextActive: {
    color: "#fff",
    fontSize: 16,
  },
  artistItem: {
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
});