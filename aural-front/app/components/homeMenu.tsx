import { Text, View, Button, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useReproBarVisibility } from "./WebPlayback";
import React, { useEffect } from "react";
import Recents from "./recents";
import NewReleases from "./newReleases";
import CreatedForU from "./createdForU";
import { useFocusEffect, useNavigation } from "expo-router";
import { useToken } from "../context/TokenContext";

interface Artist {
  id: string;
  name: string;
  images?: {
    url: string;
  }[];
};

interface Album {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
  artists: Artist[];
  type: string;
}

interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
}

interface Playlist {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
  owner: {
    display_name: string;
    id: string;
  };
}

const MAX_ELEMENTS = 20;

const HomeMenu = () => {
  const { token } = useToken();
  const navigation = useNavigation<any>();
  const { showReproBar } = useReproBarVisibility();
  useFocusEffect(() => {
    showReproBar(true);
    return () => { };
  });

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [recent, setRecent] = React.useState<any[]>([]);
  const [topArtists, setTopArtists] = React.useState<Artist[]>([]);
  const [recommendations, setRecommendations] = React.useState<Track[]>([]);
  const [releases, setReleases] = React.useState<Album[]>([]);

  useEffect(() => {
    if (!token) return;

    // Recent content
    (async () => {
      setRecent([]);
      try {
        // fetch
        const recentRes = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${50}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          }
        });

        // check for error in return
        if (!recentRes.ok) {
          setError('Failed to get recent elements.');
          throw new Error('Spotify API error: ' + `${recentRes.status} ${recentRes.statusText}`);
        }

        const recentData = await recentRes.json();
        console.log('Recent data:', recentData);
        if (!recentData) return;

        var recentContent: (Artist | Album | Playlist)[] = [];

        recentData.items.forEach(async (item: any) => {
          // Collect promises for all fetch operations
          const fetchPromises = recentData.items.map(async (item: any) => {
            if (!item.context) {
              return {
                id: item.track.album.id,
                name: item.track.album.name,
                images: item.track.album.images,
                artists: item.track.artists,
                type: item.track.album.album_type,
              } as Album;
            }

            if (item.context.type === "artist") {
              const artistRes = await fetch(`${item.context.href}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token.access_token}`,
                  "Content-Type": "application/json",
                },
              });
              if (!artistRes.ok) return null;
              const artistData = await artistRes.json();
              return {
                id: artistData.id,
                name: artistData.name,
                images: artistData.images,
              } as Artist;
            }

            if (item.context.type === "album") {
              return {
                id: item.track.album.id,
                name: item.track.album.name,
                images: item.track.album.images,
                artists: item.track.artists,
                type: item.track.album.album_type,
              } as Album;
            }

            if (item.context.type === "playlist") {
              const playlistRes = await fetch(
                `https://api.spotify.com/v1/playlists/${item.context.uri.split(":")[2]}?fields=description,id,images,name,owner,tracks`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (!playlistRes.ok) return null;
              const playlistData = await playlistRes.json();
              return {
                id: playlistData.id,
                name: playlistData.name,
                images: playlistData.images,
                owner: {
                  display_name: playlistData.owner.display_name,
                  id: playlistData.owner.id,
                },
              } as Playlist;
            }

            return null;
          });

          // Wait for all fetches to complete
          const results = await Promise.all(fetchPromises);

          // Filter out null values and remove duplicates
          const uniqueResults = results.filter(Boolean).filter((item, index, self) => {
            const stringifiedItem = JSON.stringify(item);
            return (
              index ===
              self.findIndex((obj) => JSON.stringify(obj) === stringifiedItem)
            );
          });

          setRecent(uniqueResults);
        });

        //setError('');
      } catch (e) {
        console.error(`Error fetching recent elements: ${e}`);
        setError('Failed to load recent elements');
      } finally {
        setLoading(false);
      }
    })();

    // Top artists
    (async () => {
      try {
        // fetch
        const topRes = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=${MAX_ELEMENTS}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          }
        });

        // check for error in return
        if (!topRes.ok) {
          setError('Failed to get top artists.');
          throw new Error('Spotify API error: ' + `${topRes.status} ${topRes.statusText}`);
        }

        const topData = await topRes.json();

        var topArtists: Artist[] = [];
        topData.items.forEach((item: any) => {
          const artist: Artist = {
            id: item.id,
            name: item.name,
            images: item.images,
          };
          topArtists.push(artist);
        });

        setTopArtists(topArtists);

        //setError('');
      } catch (e) {
        console.error(`Error fetching top artists: ${e}`);
        setError('Failed to load top artists');
      } finally {
        setLoading(false);
      }
    })();

    // New releases
    //tbd

  }, [token]);

  const renderArtist = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={{}}
      onPress={() =>
        navigation.navigate("checkArtistInfo/[id]", {
          id: item.id,
          name: item.name,
        })
      }>

      <View key={item.id} style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 10 }}>
        <Image
          source={{ uri: item.images && item.images[0] ? item.images[0].url : "https://via.placeholder.com/160" }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 80
          }} />
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, margin: 1, marginTop: 10, textAlign: "center" }}>{
          item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name
        }</Text>
        <Text style={{ color: "gray", fontWeight: "regular", fontStyle: "italic", fontSize: 12, margin: 1, marginTop: 5, textAlign: "center" }}>artist</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("checkAlbumInfo/[id]", {
          id: item.id,
          name: item.name,
        })
      }>
      <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 10 }}>
        <Image
          source={{ uri: item.images && item.images.length > 0 ? item.images[0].url : "https://via.placeholder.com/160" }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 8,
          }}
        />
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, margin: 1, marginTop: 10, textAlign: "left" }}>
          {item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name}
        </Text>
        <Text style={{ color: "#ffffffbb", fontWeight: "bold", fontSize: 12, margin: 1, marginTop: 5, textAlign: "left" }}>{
          item.artists[0].name.length > 20 ?
            item.artists[0].name.substring(0, 20) + "..." :
            item.artists[0].name
        }</Text>
        <Text style={{ color: "gray", fontWeight: "regular", fontStyle: "italic", fontSize: 12, margin: 1, marginTop: 5, textAlign: "left" }}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={{}}
      onPress={() =>
        navigation.navigate("checkPlaylistInfo/[id]", {
          id: item.id
        })
      }>

      <View key={item.id} style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 10 }}>
        <Image
          source={{ uri: item.images && item.images.length > 0 ? item.images[0].url : "https://via.placeholder.com/160" }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 8
          }} />
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18, margin: 1, marginTop: 10, textAlign: "left" }}>{
          item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name
        }</Text>
        <Text style={{ color: "#ffffffbb", fontWeight: "bold", fontSize: 12, margin: 1, marginTop: 5, textAlign: "left" }}>{
          item.owner?.display_name.length > 20 ?
            item.owner?.display_name.substring(0, 20) + "..." :
            item.owner?.display_name
        }</Text>
        <Text style={{ color: "gray", fontWeight: "regular", fontStyle: "italic", fontSize: 12, margin: 1, marginTop: 5, textAlign: "left" }}>playlist</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecent = ({ item }: { item: Playlist | Album | Artist }) => {
    if ('owner' in item) {
      // Render Playlist
      return renderPlaylist({ item: item as Playlist });
    } else if ('artists' in item) {
      // Render Album
      return renderAlbum({ item: item as Album });
    } else {
      // Render Artist
      return renderArtist({ item: item as Artist });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top artists */}
      <View style={styles.row}>
        <Text style={styles.rowTitle}> Your top artists </Text>
        <ScrollView
          horizontal
          style={styles.elements}
          showsHorizontalScrollIndicator={false}>
          <FlatList
            data={topArtists}
            renderItem={renderArtist}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false} />
        </ScrollView>
      </View>

      {/* Recent content */}
      <View style={styles.row}>
        <Text style={styles.rowTitle}> Recent content </Text>
        <ScrollView
          horizontal
          style={styles.elements}
          showsHorizontalScrollIndicator={false}>
          {recent.length > 0 ? (
            <FlatList
              data={recent}
              renderItem={renderRecent}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false} />) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#f05858" />
            </View>
          )}
        </ScrollView>
      </View>

    </ScrollView >

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
    backgroundColor: "#000000",
    marginTop: 80,
    marginBottom: 140,
    marginLeft: 20,
    marginRight: 20,
    width: Dimensions.get("window").width,
  },
  loaderContainer: {
    width: Dimensions.get("window").width,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  row: {
    top: 0,
    width: "100%",
    padding: 10,
    marginTop: 0,
    marginLeft: 0
  },
  rowTitle: {
    color: "#F05858",
    fontWeight: "bold",
    fontSize: 20,
    left: 5
  },
  elements: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 5,
    marginLeft: 0
  }
});

export default HomeMenu;