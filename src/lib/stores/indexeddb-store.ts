import { writable } from 'svelte/store';
import { openDB, type IDBPDatabase } from 'idb';

export interface FileData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  src: string;
  path: string;
}

export interface Folder {
  id: string;
  files: FileData[];
}

const DB_NAME = 'CollensDB';
const STORE_NAME = 'folders';

let db: IDBPDatabase;

const initDB = async () => {
  db = await openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        // Delete old store and create new one with updated schema
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
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
    // Migrate old data structure to new one
    const migratedFolders = allFolders.map(folder => ({
      id: folder.id,
      files: folder.files || folder.images?.map((img: any) => ({
        ...img,
        path: img.name
      })) || []
    }));
    set(migratedFolders);
  },
  addFolder: async (folder: Folder) => {
    // Ensure files array exists
    const folderToAdd = {
      ...folder,
      files: folder.files || []
    };
    await db.add(STORE_NAME, folderToAdd);
    update(folders => [...folders, folderToAdd]);
  },
  removeFolder: async (id: string) => {
    await db.delete(STORE_NAME, id);
    update(folders => folders.filter(f => f.id !== id));
  },
};

export const removeFolder = async (id: string) => {
  await indexedDBStore.removeFolder(id);
};
