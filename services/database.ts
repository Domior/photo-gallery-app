import { type SQLiteDatabase } from 'expo-sqlite';

export interface Photo {
  id: number;
  url: string;
  caption: string;
}

type insertPhotoProps = {
  db: SQLiteDatabase;
  url: string;
  caption: string;
};

type deletePhotoProps = {
  db: SQLiteDatabase;
  id: number;
};

export const initializeDatabase = async (db: SQLiteDatabase) =>
  await db.runAsync('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, url TEXT NOT NULL, caption TEXT NOT NULL);');

export const insertPhoto = async ({ db, url, caption }: insertPhotoProps) => await db.runAsync(`INSERT INTO photos (url, caption) VALUES (?, ?);`, [url, caption]);

export const getPhotos = async (db: SQLiteDatabase): Promise<Photo[]> => await db.getAllAsync('SELECT * FROM photos');

export const deletePhoto = async ({ db, id }: deletePhotoProps) => await db.runAsync(`DELETE FROM photos WHERE id = ?`, [id]);
