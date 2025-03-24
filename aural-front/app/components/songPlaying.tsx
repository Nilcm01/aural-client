import { Text, View, Button } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import MinimizedSong from "./minimizedSong";

export default function SongPlaying() {
  return (
    <View className="reproduction-bar" style={{ height: 60, backgroundColor: "#262626", 
      alignItems: "center", bottom: 80, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", paddingTop: 5
    }}>
       {/* To be later replaced dynamic title */} 
       <MinimizedSong />
        {/* When the user is not logged in, song reproduction not available */}
        <MaterialIcons name="play-disabled" size={30} color="white"></MaterialIcons>

        {/* Song play Icon */}
        {/* <MaterialIcons name="play-arrow" size={30} color="white"></MaterialIcons> */}

        {/* Song pause Icon */}
        {/* <MaterialIcons name="pause" size={30} color="white"></MaterialIcons>  */}

    </View>
  );
}