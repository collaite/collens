import { writable } from 'svelte/store';
import { openDB, type IDBPDatabase } from 'idb';

export interface ImageData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  src: string;
}

export interface Folder {
  id: string;
  images: ImageData[];
}

const DB_NAME = 'CollensDB';
const STORE_NAME = 'folders';

let db: IDBPDatabase;

const initDB = async () => {
  db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
};

const { subscribe, set, update } = writable<Folder[]>([]);

export const indexedDBStore = {
  subscribe,
  set,
  update,
  init: async () => {
    await initDB();
    const allFolders = await db.getAll(STORE_NAME);
    set(allFolders);
  },
  addFolder: async (folder: Folder) => {
    await db.add(STORE_NAME, folder);
    update(folders => [...folders, folder]);
  },
  removeFolder: async (id: string) => {
    await db.delete(STORE_NAME, id);
    update(folders => folders.filter(f => f.id !== id));
  },
};

export const removeFolder = async (id: string) => {
  await indexedDBStore.removeFolder(id);
};