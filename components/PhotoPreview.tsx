import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Button, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MAX_IMAGE_CAPTION_LENGTH } from '@/constants/gallery';
import { Photo } from '@/types/photo';

type Props = {
  photo: Photo;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onSave: (id: number, caption: string) => Promise<void>;
};

export function PhotoPreview({ photo, onClose, onDelete, onSave }: Props) {
  const [caption, setCaption] = useState<string>(photo.caption);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
      <TouchableOpacity onPress={onClose} style={styles.closeContainer}>
        <IconSymbol size={24} name="cross.fill" color="black" />
      </TouchableOpacity>
      <Image source={{ uri: photo.url }} style={styles.photo} />
      <TextInput style={styles.input} placeholder="Enter a caption" value={caption} onChangeText={setCaption} maxLength={MAX_IMAGE_CAPTION_LENGTH} />
      <View style={styles.photoActionButtonsContainer}>
        <Button title="Delete Photo" color="crimson" onPress={onDelete} />
        <Button
          title="Save Changes"
          onPress={() => {
            onSave(photo.id, caption);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  buttonShadow: { elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 3 },
  photoPreviewWrapper: { flex: 1, paddingBottom: 15, justifyContent: 'center' },
  photo: { flex: 1, width: '100%', height: 300, marginBottom: 15 },
  input: { width: '85%', borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 10, borderRadius: 5 },
  photoActionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 30, padding: 5 },
  closeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
