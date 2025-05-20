// components/JamRoomModal.tsx
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useJams, JamInfo } from "../utils/useJams";

interface Props {
    visible: boolean;
    session: JamInfo;
    onClose: () => void;
}

export default function JamRoomModal({ visible, session, onClose }: Props) {
    const { addSongToJam } = useJams();
    const [newTrackId, setNewTrackId] = React.useState("");

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.box}>
            <Text style={styles.title}>{session.name}</Text>
            <Text style={styles.info}>Creador: {session.creator}</Text>
            <Text style={styles.info}>Participantes: {session.participants.length}</Text>

            {session.currentTrack && (
            <Text style={styles.info}>
                🎵 Ahora suena: {session.currentTrack.name}
            </Text>
            )}

            <Text style={styles.info}>Playlist:</Text>
            {session.playlist.map((id, i) => (
            <Text key={id} style={styles.track}>
                {i + 1}. {id}
            </Text>
            ))}

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    value={newTrackId}
                    onChangeText={setNewTrackId}
                    placeholder="ID de canción"
                    placeholderTextColor="#666"
                />
                <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => {
                    if (newTrackId.trim()) {
                        addSongToJam(session.jamId, newTrackId.trim());
                        setNewTrackId("");
                    }
                    }}
                >
                    <Text style={styles.smallBtnText}>Enviar</Text>
                </TouchableOpacity>
            </View>


            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    box: {
        backgroundColor: "#1A1A1A",
        padding: 20,
        borderRadius: 12,
        width: "85%",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#F05858",
        marginBottom: 12,
    },
    info: {
        color: "white",
        marginBottom: 10,
        fontSize: 16,
    },
    closeBtn: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#F05858",
        borderRadius: 8,
        alignItems: "center",
    },
    closeText: {
        color: "white",
        fontWeight: "bold",
    },
    track: {
        color: "#BBBBBB",
        fontSize: 14,
        marginLeft: 8,
    },
    addBtn: {
        marginTop: 16,
        backgroundColor: "#333",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
    },
    addText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#444",
        padding: 8,
        color: "white",
        marginRight: 8,
        borderRadius: 4,
    },
    row: { flexDirection: "row", marginTop: 16, alignItems: "center" },
    smallBtn: { padding: 10, backgroundColor: "#F05858", borderRadius: 4 },
    smallBtnText: { color: "white", fontWeight: "bold" },
});
