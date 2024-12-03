import { useState } from 'react';
import { useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, StyleSheet, View, Image, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CameraComponent } from '@/components/CameraComponent';
import { ThemedText } from '@/components/ThemedText';
import { uploadPhotoToS3 } from '@/services/s3';
import { insertPhoto } from '@/services/database';
import { MAX_IMAGE_CAPTION_LENGTH } from '@/constants/gallery';

export default function Camera() {
  const db = useSQLiteContext();
  const [permission, requestPermission] = useCameraPermissions();

  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const clearState = () => {
    setPhoto(null);
    setCaption('');
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleSavePhoto = async () => {
    if (!photo || !caption.trim()) {
      Alert.alert('Please provide a caption and take a photo.');
      return;
    }

    setIsLoading(true);

    try {
      const s3Url = await uploadPhotoToS3(photo);
      if (!s3Url) return Alert.alert('S3 upload failed.');
      await insertPhoto({ db, url: s3Url, caption });
      Alert.alert('Photo successfully saved!');
      clearState();
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Failed to save photo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {photo ? (
          <KeyboardAvoidingView style={styles.photoPreviewWrapper} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
            {isLoading ? (
              <ActivityIndicator size={'large'} />
            ) : (
              <>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter a caption"
                  placeholderTextColor="gray"
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={MAX_IMAGE_CAPTION_LENGTH}
                />
                <View style={styles.photoActionButtonsContainer}>
                  <Button title="Retake" onPress={clearState} />
                  <Button title="Save Photo" onPress={handleSavePhoto} />
                </View>
              </>
            )}
          </KeyboardAvoidingView>
        ) : (
          <CameraComponent onSetPhoto={setPhoto} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: 'center' },
  photoPreviewWrapper: { flex: 1, justifyContent: 'center', marginBottom: 55, paddingHorizontal: 10 },
  photo: { flex: 1, width: '100%', height: 300, marginBottom: 15 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10, marginHorizontal: 30, backgroundColor: 'white', borderColor: '#ccc', borderRadius: 5, color: 'black' },
  photoActionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 30, padding: 5 },
});
