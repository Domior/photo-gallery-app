import { useState } from 'react';
import { CameraType, FlashMode } from 'expo-camera';
import { CAMERA_TYPE, CAMERA_FLASH_MODE } from '@/enums/camera';

interface UseCameraReturn {
  facing: CameraType;
  flashMode: FlashMode;
  toggleFlashMode: () => void;
  toggleCameraFacing: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const [facing, setFacing] = useState<CameraType>(CAMERA_TYPE.BACK);
  const [flashMode, setFlashMode] = useState<FlashMode>(CAMERA_FLASH_MODE.OFF);

  const toggleFlashMode = () => {
    setFlashMode(prev => (prev === CAMERA_FLASH_MODE.ON ? CAMERA_FLASH_MODE.OFF : prev === CAMERA_FLASH_MODE.OFF ? CAMERA_FLASH_MODE.AUTO : CAMERA_FLASH_MODE.ON));
  };
  const toggleCameraFacing = () => {
    setFacing(current => (current === CAMERA_TYPE.BACK ? CAMERA_TYPE.FRONT : CAMERA_TYPE.BACK));
  };

  return {
    facing,
    flashMode,
    toggleFlashMode,
    toggleCameraFacing,
  };
};
