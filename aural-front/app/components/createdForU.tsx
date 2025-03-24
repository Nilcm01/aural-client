import React from "react";
import { View, Text, Button, ScrollView } from "react-native";

const MAX_FOR_YOU = 5;

export default function CreatedForU () {
    return (
        <ScrollView horizontal style={{ flexDirection: "row", paddingVertical: 10}}>
            <View style={{ display: "flex", flexDirection: "row" , marginLeft: 10}}>
                {Array.from({ length: MAX_FOR_YOU }).map((_, counter) => (
                    <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 10}} >
                        <View style={{ backgroundColor: "white", height: 80, width: 80, borderRadius: 2}} />
                        <Text style={{color: "white", fontWeight:"bold", fontSize: 18, margin: 1}}>Title </Text>
                        <Text style={{color: "#9A9A9A", fontWeight:"bold", fontSize: 14}}> Artist </Text> 
                        <Text style={{color: "#9A9A9A", fontWeight:"medium", fontSize: 12}}> Type </Text> 
                    </View>
                ))}
            </View>
        </ ScrollView>
    );
}