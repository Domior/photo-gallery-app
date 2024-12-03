import { type SQLiteDatabase } from 'expo-sqlite';
import { Photo } from '@/types/photo';
import { getPhotosProps, insertPhotoProps, updatePhotoProps, deletePhotoProps } from '@/types/database';

export const initializeDatabase = async (db: SQLiteDatabase) =>
  await db.runAsync('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, url TEXT NOT NULL, caption TEXT NOT NULL);');

export const getPhotos = async ({ db }: getPhotosProps): Promise<Photo[]> => await db.getAllAsync('SELECT * FROM photos');

export const insertPhoto = async ({ db, url, caption }: insertPhotoProps) => await db.runAsync(`INSERT INTO photos (url, caption) VALUES (?, ?);`, [url, caption]);

export const updatePhoto = async ({ db, id, caption }: updatePhotoProps) => await db.runAsync(`UPDATE photos SET caption = ? WHERE id = ?`, [caption, id]);

export const deletePhoto = async ({ db, id }: deletePhotoProps) => await db.runAsync(`DELETE FROM photos WHERE id = ?`, [id]);
