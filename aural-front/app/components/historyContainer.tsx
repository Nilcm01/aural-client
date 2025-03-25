import React from 'react';
import { Text, View, Button, ScrollView } from 'react-native';

export default function HistoryContainer () {
    return (
        <View style={{flex: 1, flexDirection: "column", borderColor: "white", borderWidth: 2, borderRadius: 10, width: 320, height: 500, top: 0, zIndex: 10, backgroundColor: "white", position: "absolute"}}>
            <ScrollView>
                <Text>jlkdjslkajdklsjlkasjlkdsa</Text>
            </ScrollView>
        </View>
    );
}