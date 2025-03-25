import React from 'react';
import { Text, View, Button, ScrollView, Pressable, TextInput } from 'react-native';

export default function HistoryContainer () {
    return (
        <View style={{flex: 1, flexDirection: "column", borderColor: "white", borderWidth: 2, borderRadius: 10, width: 350, height: 50, top: 0, zIndex: 10, backgroundColor: "#9A9A9A", position: "absolute", marginTop: 60 }}>
            <ScrollView>
                <TextInput
                    style={{  borderColor: 'white', borderWidth: 0, width: 320, backgroundColor: "#9A9A9A", borderRadius: 20, padding: 10, color: "black", marginTop: 2 }}
                    //onChangeText={() => text => onChangeText(text)} 
                    // value={value}
                    placeholder="Search history..."
                >
                </ TextInput>
            </ScrollView>
        </View>
    );
}