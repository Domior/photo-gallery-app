import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Button, Dimensions, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { initializeDatabase, getPhotos, deletePhoto, updatePhoto } from '@/services/database';
import { deletePhotoFromS3 } from '@/services/s3';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PhotoPreview } from '@/components/PhotoPreview';
import { VIEW_MODE } from '@/enums/gallery';
import { IMAGE_SPACING, MIN_COLUMN_WIDTH, MIN_NUM_COLUMNS } from '@/constants/gallery';
import { Photo } from '@/types/photo';

export default function PhotoGallery() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [photoPreview, setPhotoPreview] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.GRID);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  const numColumns = viewMode === VIEW_MODE.GRID ? Math.floor(screenWidth / MIN_COLUMN_WIDTH) : MIN_NUM_COLUMNS;
  const imageSize = screenWidth / numColumns - IMAGE_SPACING;

  const handleScreenResize = useCallback(() => {
    setScreenWidth(Dimensions.get('window').width);
  }, []);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      initializeDatabase(db);
      const response = await getPhotos({ db });
      setPhotos(response);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos.');
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  const deleteSelectedPhotos = async () => {
    setIsLoading(true);
    try {
      const deleteFromDB = selectedPhotos.map(photo => deletePhoto({ db, id: photo.id }));
      const deleteFromS3 = selectedPhotos.map(photo => deletePhotoFromS3(`${process.env.EXPO_PUBLIC_S3_BUCKET_FOLDER}/${photo.url.split('/').pop()}`));
      await Promise.all([...deleteFromDB, ...deleteFromS3]);

      setSelectedPhotos([]);
      setPhotoPreview(null);
      loadPhotos();
    } catch (error) {
      console.error('Error deleting photos:', error);
      Alert.alert('Error', 'Failed to delete selected photos.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePhotoCaption = async (id: number, caption: string) => {
    if (!photoPreview) return;
    try {
      await updatePhoto({ db, id, caption });
      Alert.alert('Photo successfully updated!');
    } catch (error) {
      console.error('Error updating photo:', error);
      Alert.alert('Error', 'Failed to update photo caption.');
    }
  };

  const toggleSelection = (photo: Photo) => {
    setSelectedPhotos(prev => (prev.some(p => p.id === photo.id) ? prev.filter(p => p.id !== photo.id) : [...prev, photo]));
  };

  useEffect(() => {
    if (isFocused) {
      loadPhotos();
    }
  }, [isFocused, loadPhotos]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleScreenResize);
    return () => subscription.remove();
  }, [handleScreenResize]);

  const renderPhotoItem = useCallback(
    ({ item }: { item: Photo }) => {
      const isSelected = selectedPhotos.some(p => p.id === item.id);
      return (
        <TouchableOpacity
          onPress={() => {
            setPhotoPreview(item);
            setSelectedPhotos([item]);
          }}
          onLongPress={() => toggleSelection(item)}
          style={{
            flex: 1 / numColumns,
            alignItems: 'center',
            padding: 5,
          }}
        >
          <View>
            <Image
              source={{ uri: item.url }}
              style={{
                width: imageSize,
                height: imageSize,
                resizeMode: viewMode === VIEW_MODE.GRID ? 'cover' : 'contain',
                opacity: isSelected ? 0.6 : 1,
              }}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                width: imageSize,
                marginTop: 5,
                textAlign: 'center',
                color: isSelected ? 'crimson' : 'black',
                fontSize: viewMode === VIEW_MODE.GRID ? 14 : 20,
              }}
            >
              {item.caption}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedPhotos, numColumns, imageSize, viewMode],
  );

  const renderHeader = () => {
    const isAllSelected = selectedPhotos.length === photos.length;
    const hasSelection = !!selectedPhotos.length;

    return (
      <>
        <View style={styles.headerTop}>
          {isAllSelected && <Button title={`Deselect All`} onPress={() => setSelectedPhotos([])} />}
          {hasSelection && !isAllSelected && <Button title={`Deselect (${selectedPhotos.length})`} onPress={() => setSelectedPhotos([])} />}
          {hasSelection && <Button title={`Delete Selected`} color="crimson" onPress={deleteSelectedPhotos} />}
        </View>
        <TouchableOpacity onPress={() => setViewMode(prev => (prev === VIEW_MODE.GRID ? VIEW_MODE.LIST : VIEW_MODE.GRID))}>
          <IconSymbol size={28} name={viewMode === VIEW_MODE.GRID ? 'list.bullet.rectangle.fill' : 'square.grid.3x3.fill.square'} color="black" />
        </TouchableOpacity>
      </>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {!!photos.length ? (
          photoPreview ? (
            <PhotoPreview
              photo={photoPreview}
              onClose={() => {
                setPhotoPreview(null);
                setSelectedPhotos([]);
                loadPhotos();
              }}
              onDelete={deleteSelectedPhotos}
              onSave={updatePhotoCaption}
            />
          ) : (
            <>
              {renderHeader()}
              <FlatList
                key={viewMode}
                data={photos}
                keyExtractor={item => item.id.toString()}
                renderItem={renderPhotoItem}
                numColumns={numColumns}
                contentContainerStyle={styles.photosContainer}
              />
            </>
          )
        ) : (
          <View style={styles.placeholderContainer}>
            <ThemedText type="title">No photos found</ThemedText>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, paddingBottom: 20, backgroundColor: 'white' },
  loadingWrapper: { flex: 1, justifyContent: 'center' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  photosContainer: { paddingBottom: 10, marginTop: 15 },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
