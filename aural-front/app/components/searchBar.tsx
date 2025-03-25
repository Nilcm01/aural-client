import React from 'react';
import { Text, View, TextInput, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import HistoryContainer from "../components/historyContainer";

export default function SearchBar() {

    const showHistory = (): void => {
        console.log("History");
        <HistoryContainer />
    };

    return (
        <View style={{flex: 1, flexDirection: "row", justifyContent: "center", marginTop: 20}}>
            <TextInput
                style={{ height: 40, borderColor: 'white', borderWidth: 2, width: 320, backgroundColor: "white", borderRadius: 20, padding: 10, color: "black" }}
                onChangeText={() => showHistory()} // text => onChangeText(text)</View>
                // value={value}
                placeholder="Search..."
            >

            </ TextInput>
            <MaterialIcons name="search" size={32} color={"white"} style={{marginLeft: 6, marginTop: 2}} />
        </View>
    );
}