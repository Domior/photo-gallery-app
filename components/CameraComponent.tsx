import { useRef } from 'react';
import { CameraView, CameraCapturedPicture, FlashMode } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CAMERA_FLASH_MODE } from '@/enums/camera';
import { useCamera } from '@/hooks/useCamera';

type Props = {
  onSetPhoto: (photo: CameraCapturedPicture) => void;
};

export function CameraComponent({ onSetPhoto }: Props) {
  const cameraRef = useRef<CameraView>(null);

  const { facing, flashMode, toggleFlashMode, toggleCameraFacing } = useCamera();

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true, exif: false };
      const photo = await cameraRef.current.takePictureAsync(options);
      if (photo) onSetPhoto(photo);
    }
  };

  return (
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
          onPress={toggleFlashMode}
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
          <View style={styles.cameraPhotoButton} />
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
  );
}

const styles = StyleSheet.create({
  cameraWrapper: { flex: 1, paddingBottom: 15, paddingHorizontal: 15 },
  cameraButtonsContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  cameraPhotoButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', borderWidth: 2, borderColor: '#d1d1d1' },
  cameraActionButton: { alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: 'white', bottom: 0 },
  buttonShadow: { elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 3 },
});
