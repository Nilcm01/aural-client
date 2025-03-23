import { Text, View, Button } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import React from "react";
import Recents from "./recents";
import NewReleases from "./newReleases";
import CreatedForU from "./createdForU";

export default function HomeMenu() {
  return (
    <View className="home-menu" style={{ marginLeft: 20}}>
       {/* To be later replaced by dynamic sections */} 
       <View style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 10 }}>  

        {/* Recent content */}
        <View style={{ position: "sticky", top: 0, width: "100%", padding: 10, marginTop: 40, marginLeft: 10 }}>
          <Text style={{ color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14 }}> Recents </Text>
          <Recents />
        </View>

        {/* New releases interests for user */}
        <View style={{ position: "sticky", top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
          <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> New Releases </Text>
          <NewReleases />
        </View>
        
        {/* Created for the interests of the user */}
        <View style={{ position: "sticky", top: 0, width: "100%", padding: 10, marginLeft: 10 }}>
          <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20, left: 14}}> Created for you </Text>
          <CreatedForU />
        </View>
        
       </View>
    </View>
  );
}