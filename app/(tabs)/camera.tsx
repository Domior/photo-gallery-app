import { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture, FlashMode } from 'expo-camera';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { uploadPhotoToS3 } from '@/services/s3';
import { insertPhoto } from '@/services/database';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CAMERA_TYPE, CAMERA_FLASH_MODE } from '@/enums/camera';
import { MAX_IMAGE_CAPTION_LENGTH } from '@/constants/gallery';

export default function Camera() {
  const db = useSQLiteContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(CAMERA_TYPE.BACK);
  const [flashMode, setFlashMode] = useState<FlashMode>(CAMERA_FLASH_MODE.OFF);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const clearState = () => {
    setPhoto(null);
    setCaption('');
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true, exif: false };
      const photo = await cameraRef.current.takePictureAsync(options);
      if (photo) setPhoto(photo);
    }
  };

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

  const handleFlashMode = () => {
    setFlashMode(prev => (prev === CAMERA_FLASH_MODE.ON ? CAMERA_FLASH_MODE.OFF : prev === CAMERA_FLASH_MODE.OFF ? CAMERA_FLASH_MODE.AUTO : CAMERA_FLASH_MODE.ON));
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === CAMERA_TYPE.BACK ? CAMERA_TYPE.FRONT : CAMERA_TYPE.BACK));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {photo ? (
          <View style={styles.photoPreviewWrapper}>
            {isLoading ? (
              <ActivityIndicator size={'large'} />
            ) : (
              <>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TextInput style={styles.input} placeholder="Enter a caption" value={caption} onChangeText={setCaption} maxLength={MAX_IMAGE_CAPTION_LENGTH} />
                <View style={styles.photoActionButtonsContainer}>
                  <Button title="Retake" onPress={clearState} />
                  <Button title="Save Photo" onPress={handleSavePhoto} />
                </View>
              </>
            )}
          </View>
        ) : (
          <CameraView ref={cameraRef} style={styles.cameraWrapper} facing={facing} mode="picture" flash={flashMode} autofocus="on" enableTorch>
            <View style={styles.cameraButtonsContainer}>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  ...styles.cameraActionButton,
                  ...styles.buttonShadow,
                }}
                onPress={handleFlashMode}
              >
                {flashMode === CAMERA_FLASH_MODE.ON ? (
                  <IconSymbol size={26} name="flashlight.on.fill" color="black" />
                ) : flashMode === CAMERA_FLASH_MODE.OFF ? (
                  <IconSymbol size={24} name="flashlight.off.fill" color="black" />
                ) : (
                  <>
                    <IconSymbol size={24} name="flashlight.on.fill" color="black" />
                    <Text style={{ fontSize: 10, color: 'black', textAlign: 'center' }}>Auto</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={takePicture}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  ...styles.cameraActionButton,
                  ...styles.buttonShadow,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: '#d1d1d1',
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  ...styles.cameraActionButton,
                  ...styles.buttonShadow,
                }}
                onPress={toggleCameraFacing}
              >
                <IconSymbol size={26} name="camera.rotate.fill" color="black" />
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: 'center' },
  cameraWrapper: { flex: 1, paddingBottom: 15, paddingHorizontal: 15 },
  cameraButtonsContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  cameraActionButton: { alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: 'white', bottom: 0 },
  buttonShadow: { elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 3 },
  photoPreviewWrapper: { flex: 1, paddingBottom: 15, justifyContent: 'center' },
  photo: { flex: 1, width: '100%', height: 300, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 10, marginHorizontal: 20, borderRadius: 5 },
  photoActionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 30, padding: 5 },
});
