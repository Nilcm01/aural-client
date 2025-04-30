// components/PublishModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ResizeMode, Video } from 'expo-av';
import { useToken } from '../context/TokenContext';

export type PublicationType = 'text' | 'image' | 'video' | 'link';

interface PublishModalProps {
  visible: boolean;
  onClose: () => void;
  onPublished?: () => void; // ahora opcional
}

const PublishModal: React.FC<PublishModalProps> = ({
  visible,
  onClose,
  onPublished,
}) => {
  const { token } = useToken();
  const currentUserId = token?.user_id;

  const [type, setType] = useState<PublicationType>('text');
  const [content, setContent] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  //const host = Platform.OS === 'android' ? '10.0.2.2:5000' : 'localhost:5000';
  //const API_BASE = `http://${host}/api/items`;
  const API_BASE = `https://aural-454910.ew.r.appspot.com/api/items`;

  useEffect(() => {
    if ((type === 'image' || type === 'video') && visible) {
      ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => {
        if (status !== 'granted') {
          alert('Permission to access media library is required!');
        }
      });
    }
  }, [type, visible]);

  useEffect(() => {
    if (!visible) {
      setType('text');
      setContent('');
      setPreview('');
    }
  }, [visible]);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        type === 'image'
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPreview(uri);
      setContent(uri);
    }
  };

  const uploadMediaAndGetUrl = async (uri: string): Promise<string> => {
    // descargamos el archivo
    const resp = await fetch(uri);
    const blob = await resp.blob();
    const form = new FormData();

    // Backend espera campo 'image', usamos same field name tanto para imagen como vídeo
    if (Platform.OS === 'web') {
      form.append('image', blob, `upload.${type === 'video' ? 'mp4' : 'jpg'}`);
    } else {
      form.append('image', {
        uri,
        name: `upload.${type === 'video' ? 'mp4' : 'jpg'}`,
        type: blob.type,
      } as any);
    }

    console.log('🚀 Uploading media to:', `${API_BASE}/upload`);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('❌ Upload error response:', text);
      throw new Error(`Upload failed ${res.status}`);
    }
    const { imageUrl } = await res.json();
    console.log('✅ Uploaded, got URL:', imageUrl);
    return imageUrl;
  };

  const postPublication = async (finalContent: string) => {
    if (!currentUserId) {
      throw new Error('No user ID available');
    }
    const url = `${API_BASE}/addPublications`;
    const body = { userId: currentUserId, content: finalContent };
    console.log('✍️  POST publication to:', url, 'body:', body);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('❌ Publish error response:', text);
      throw new Error(`Publish failed ${res.status}`);
    }
    console.log('✅ Publication created');
  };

  const handleSubmit = async () => {
    try {
      if ((type === 'text' || type === 'link') && !content.trim()) {
        return alert('El contenido no puede estar vacío.');
      }
      setLoading(true);

      let toSend = content.trim();

      // para imagen o vídeo, subir primero y obtener URL
      if (type === 'image' || type === 'video') {
        toSend = await uploadMediaAndGetUrl(content);
      }

      await postPublication(toSend);

      // reset + callback
      setContent('');
      setPreview('');
      onPublished?.();
      onClose();
    } catch (e: any) {
      console.error(e);
      alert('Error publishing: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Publish a new post</Text>

          <Picker
            selectedValue={type}
            style={styles.picker}
            onValueChange={val => setType(val as PublicationType)}
          >
            <Picker.Item label="Text" value="text" />
            <Picker.Item label="Image" value="image" />
            <Picker.Item label="Video" value="video" />
            <Picker.Item label="Link" value="link" />
          </Picker>

          {type === 'image' && (
            <>
              <TouchableOpacity style={styles.selectBtn} onPress={pickMedia}>
                <Text style={styles.selectBtnText}>Choose Image</Text>
              </TouchableOpacity>
              {preview ? (
                <Image source={{ uri: preview }} style={styles.preview} />
              ) : null}
            </>
          )}

          {type === 'video' && (
            <>
              <TouchableOpacity style={styles.selectBtn} onPress={pickMedia}>
                <Text style={styles.selectBtnText}>Choose Video</Text>
              </TouchableOpacity>
              {preview ? (
                <Video
                  source={{ uri: preview }}
                  style={styles.previewVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              ) : null}
            </>
          )}

          {(type === 'text' || type === 'link') && (
            <TextInput
              style={styles.input}
              placeholder={type === 'link' ? 'Paste URL…' : 'Write your post…'}
              placeholderTextColor="#aaa"
              value={content}
              onChangeText={setContent}
              multiline={type === 'text'}
            />
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Publishing…' : 'Submit'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 8 }}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#f05858',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  picker: {
    backgroundColor: '#141218',
    color: 'white',
    marginBottom: 15,
  },
  selectBtn: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectBtnText: {
    color: 'white',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  previewVideo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'black',
  },
  input: {
    backgroundColor: '#141218',
    color: 'white',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  btn: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
  },
  cancel: {
    color: '#f05858',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default PublishModal;
