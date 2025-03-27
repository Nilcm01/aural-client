import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { FooterBarButton } from '../components/footerBar';  
import MinimizedSong from '../components/minimizedSong'; 
import ReproductionBar from '../components/reproductionBar'; 
import SongPlaying from '../components/songPlaying';


export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs 
        screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBarStyle, 
            tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons name="home" size={30} color={focused ? "white" : "#9A9A9A"} />
                <FooterBarButton title="Home" onPress={() => {}} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: "Sessions",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons name="wifi-tethering" size={30} color={focused ? "white" : "#9A9A9A"} />
                <FooterBarButton title="Sessions" onPress={() => {}} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons name="search" size={30} color={focused ? "white" : "#9A9A9A"} />
                <FooterBarButton title="Search" onPress={() => {}} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "Xats",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons name="chat" size={30} color={focused ? "white" : "#9A9A9A"} />
                <FooterBarButton title="Xats" onPress={() => {}} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="libraries"
          options={{
            title: "Libraries",
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons name="grid-view" size={30} color={focused ? "white" : "#9A9A9A"} />
                <FooterBarButton title="Libraries" onPress={() => {}} />
              </View>
            ),
          }}
        />
      </Tabs>

      {/* Reproduction Bar and Song Playing components */}
      <SongPlaying />
      <ReproductionBar />
    </View>
  );
}

const styles = StyleSheet.create({
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 5, 
    },
    tabBarStyle: {
      height: 110,
      backgroundColor: "#262626",
      alignItems: "center",
      position: "absolute",
      bottom: 0,
      width: "100%",
      display: "flex",
      flexDirection: "row",
      paddingHorizontal: 30,
      zIndex: 0,
    },
    footerButton: {
      fontSize: 12,
      color: "white",
      textAlign: "center",
      marginTop: 4, 
    },
  });
  
