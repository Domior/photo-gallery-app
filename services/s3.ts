import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system';
import { CameraCapturedPicture } from 'expo-camera';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

const s3 = new S3Client({
  region: process.env.EXPO_PUBLIC_AWS_REGION ?? '',
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY ?? '',
    secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_KEY ?? '',
  },
});

export const uploadPhotoToS3 = async (photo: CameraCapturedPicture) => {
  const fileInfo = await FileSystem.getInfoAsync(photo.uri);
  if (!fileInfo.exists) {
    throw new Error('File does not exist at URI: ' + photo.uri);
  }

  const blob = await FileSystem.readAsStringAsync(photo.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const key = `${process.env.EXPO_PUBLIC_S3_BUCKET_FOLDER}/${uuidv4()}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(blob, FileSystem.EncodingType.Base64),
    ContentType: 'image/jpeg',
  });

  try {
    await s3.send(command);
    return `https://${process.env.EXPO_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.EXPO_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 Upload Error:', error);
  }
};

export const deletePhotoFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3.send(command);
  } catch (error) {
    console.error('S3 Delete Error:', error);
  }
};
