import { Text, View, Button, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useReproBarVisibility } from "./WebPlayback";
import React from "react";
import Recents from "./recents";
import NewReleases from "./newReleases";
import CreatedForU from "./createdForU";

export default function HomeMenu() {
  const { showReproBar } = useReproBarVisibility();
  showReproBar(true);
  return (
    <ScrollView style={{ flex: 1, zIndex: 0}}>
        <View className="home-menu" style={{ left: 0, paddingBottom: 160, top: 40}}>
          {/* To be later replaced by dynamic sections */} 
          <View style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 10 }}>  

          {/* Recent content */}
          <View style={{ top: 0, width: "100%", padding: 10, marginTop: 40, marginLeft: 10 }}>
            <Text style={{ color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14 }}> Recents </Text>
            <Recents />
          </View>

          {/* New releases interests for user */}
          <View style={{ top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
            <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> New Releases </Text>
            <NewReleases />
          </View>
          
          {/* Created for the interests of the user */}
          <View style={{ top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
            <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> Created for you </Text>
            <CreatedForU />
          </View>

          {/* EXAMPLE */}
          <View style={{ top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
            <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> EXAMPLE </Text>
            <CreatedForU />
          </View>
          
          {/* EXAMPLE */}
          <View style={{ top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
            <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> EXAMPLE </Text>
            <CreatedForU />
          </View>

          {/* EXAMPLE */}
          <View style={{ top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
            <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> EXAMPLE </Text>
            <CreatedForU />
          </View>
          
        </View>
      </View>
      
    </ScrollView>
    
  );
}