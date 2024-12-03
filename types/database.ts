import { type SQLiteDatabase } from 'expo-sqlite';

export type getPhotosProps = {
  db: SQLiteDatabase;
};

export type insertPhotoProps = {
  db: SQLiteDatabase;
  url: string;
  caption: string;
};

export type updatePhotoProps = {
  db: SQLiteDatabase;
  id: number;
  caption: string;
};

export type deletePhotoProps = {
  db: SQLiteDatabase;
  id: number;
};
