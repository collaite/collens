import { writable } from 'svelte/store';
import { openDB, type IDBPDatabase } from 'idb';
import { goto } from '$app/navigation';
import { base } from '$app/paths';

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
  title?: string;
  description?: string;
}

const DB_NAME = 'CollensDB';
const STORE_NAME = 'folders';

let db: IDBPDatabase;

const initDB = async () => {
  db = await openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 3) {
        // Delete old store and create new one with updated schema
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

// Helper function to extract witness number from folder ID
function getWitnessNumber(folderId: string): number {
  const match = folderId.match(/witness_(\d+)/);
  return match ? parseInt(match[1]) : Infinity;
}

// List of example folders in static/documents (update as needed)
const EXAMPLES = ['example1', 'infinito', 'sheherazade'];

const { subscribe, set, update } = writable<Folder[]>([]);

// Dynamically get all example folders in static/documents
async function getExampleFolders(): Promise<string[]> {
  try {
    const response = await fetch(`${base}/documents/`);
    // This will not work in production (static) builds, so fallback to hardcoded if needed
    // For dev, you can use a server endpoint or generate an index.json
    // Here, fallback to hardcoded for static
    return ['example1', 'infinito', 'sheherazade'];
  } catch {
    return ['example1', 'infinito', 'sheherazade'];
  }
}

// Dynamically get all subfolders (witnesses/authors/reviews) for an example
async function getExampleSubfoldersDynamic(exampleName: string): Promise<string[]> {
  try {
    const response = await fetch(`${base}/documents/${exampleName}/`);
    // This will not work in production (static) builds, so fallback to hardcoded if needed
    // For dev, you can use a server endpoint or generate an index.json
    // Here, fallback to hardcoded for static
    if (exampleName === 'example1') return ['witness_1', 'witness_2'];
    if (exampleName === 'infinito') return ['witness_1', 'witness_2', 'witness_3', 'witness_4'];
    if (exampleName === 'sheherazade') return ['witness_1', 'witness_2'];
    return [];
  } catch {
    if (exampleName === 'example1') return ['witness_1', 'witness_2'];
    if (exampleName === 'infinito') return ['witness_1', 'witness_2', 'witness_3', 'witness_4'];
    if (exampleName === 'sheherazade') return ['witness_1', 'witness_2'];
    return [];
  }
}

export const indexedDBStore = {
  subscribe,
  set,
  update,
  init: async () => {
    await initDB();
    const allFolders = await db.getAll(STORE_NAME);
    const migratedFolders = allFolders
      .map(folder => ({
        id: folder.id,
        files: folder.files || folder.images?.map((img: any) => ({
          ...img,
          path: img.name
        })) || [],
        title: folder.title || 'Untitled Document',
        description: folder.description || 'No description available'
      }))
      .sort((a, b) => getWitnessNumber(a.id) - getWitnessNumber(b.id));

    set(migratedFolders);
    // Removed automatic example loading
  },

  // Load all examples from static/documents
  loadAllExamples: async () => {
    const examples = await getExampleFolders();
    for (const example of examples) {
      await indexedDBStore.loadExampleFolders(example);
    }
  },

  // Load all folders (witnesses/authors/reviews) for a given example
  loadExampleFolders: async (exampleName: string) => {
    try {
      const projectDetailsResponse = await fetch(`${base}/documents/${exampleName}/project_details.json`);
      const projectDetails = await projectDetailsResponse.json();
      const subfolders = await getExampleSubfoldersDynamic(exampleName);
      let allFiles: FileData[] = [];
      for (const subfolder of subfolders) {
        const files = await loadExampleFiles(exampleName, subfolder);
        allFiles = allFiles.concat(files);
      }
      if (allFiles.length > 0) {
        const folder: Folder = {
          id: `${exampleName}`,
          files: allFiles,
          title: projectDetails.title || exampleName,
          description: projectDetails.description || ''
        };
        await db.add(STORE_NAME, folder);
        update(folders => [...folders, folder].sort((a, b) => getWitnessNumber(a.id) - getWitnessNumber(b.id)));
      }
    } catch (error) {
      console.error(`Error loading example folder "${exampleName}":`, error);
    }
  },

  addFolder: async (folder: Folder) => {
    // Only add the folder, don't try to fetch project_details.json again
    const files = folder.files || [];
    const folderToAdd = {
      ...folder,
      files,
      title: folder.title || 'Untitled Document',
      description: folder.description || 'No description available'
    };
    await db.add(STORE_NAME, folderToAdd);
    update(folders => [...folders, folderToAdd].sort((a, b) => getWitnessNumber(a.id) - getWitnessNumber(b.id)));
  },
  removeFolder: async (id: string) => {
    await db.delete(STORE_NAME, id);
    update(folders => folders.filter(f => f.id !== id));
  },
};

export const removeFolder = async (id: string) => {
  await indexedDBStore.removeFolder(id);
  goto(`${base}/`);
};

// Helper function to load witness files
async function loadWitnessFiles(witnessFolder: string): Promise<FileData[]> {
  const files: FileData[] = [];

  try {
    // Load image files (1.png, 2.png, etc.)
    for (let i = 1; i <= 20; i++) {
      try {
        const response = await fetch(`${base}/example1/${witnessFolder}/${i}.png`);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          const src = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          files.push({
            name: `${i}.png`,
            size: blob.size,
            type: blob.type,
            lastModified: new Date().getTime(),
            src,
            path: `${witnessFolder}/${i}.png`
          });
        }
      } catch (error) {
        // Skip if image doesn't exist
        continue;
      }
    }

    // Load text and XML files
    const fileNames = witnessFolder === 'witness_1'
      ? ['ms-aladin-simplified_1a.txt', 'ms-aladin-simplified_1b.txt', 'ms-aladin-simplified.xml']
      : ['ts-aladin-simplified_1a.txt', 'ts-aladin-simplified_1b.txt', 'ts-aladin-simplified.xml'];

    for (const fileName of fileNames) {
      try {
        const response = await fetch(`${base}/example1/${witnessFolder}/${fileName}`);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          const src = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          files.push({
            name: fileName,
            size: blob.size,
            type: blob.type || 'text/plain',
            lastModified: new Date().getTime(),
            src,
            path: `${witnessFolder}/${fileName}`
          });
        }
      } catch (error) {
        // Skip if file doesn't exist
        continue;
      }
    }
  } catch (error) {
    console.error(`Error loading ${witnessFolder} files:`, error);
  }

  return files;
}

// Helper: get all subfolders (witnesses/authors/reviews) for an example (hardcoded for now)
async function getExampleSubfolders(exampleName: string): Promise<string[]> {
  // You can make this dynamic by reading an index.json or similar if you add one
  if (exampleName === 'example1') return ['witness_1', 'witness_2'];
  if (exampleName === 'infinito') return ['witness_1', 'witness_2', 'witness_3'];
  if (exampleName === 'sheherazade') return ['Author 1', 'Review 2'];
  return [];
}

// Helper: load all files for a given example/subfolder
async function loadExampleFiles(exampleName: string, subfolder: string): Promise<FileData[]> {
  const files: FileData[] = [];
  // Try to list all files in the subfolder (static build fallback: try common extensions and patterns)
  const extensions = [
    'png', 'jpg', 'jpeg', 'webp', 'tiff', 'avif', // images
    'xml', 'txt' // text/xml
  ];
  // Try up to 20 for numbered files
  for (let i = 1; i <= 20; i++) {
    for (const ext of extensions) {
      try {
        const response = await fetch(`${base}/documents/${exampleName}/${subfolder}/${i}.${ext}`);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          const src = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          files.push({
            name: `${i}.${ext}`,
            size: blob.size,
            type: blob.type,
            lastModified: new Date().getTime(),
            src,
            path: `${subfolder}/${i}.${ext}`
          });
        }
      } catch { continue; }
    }
  }
  // Try known custom-named files (for sheherazade, infinito, etc.)
  const customFiles = [
    // Infinito
    'Infinito-W1-AN.jpg', 'infinito-W1-AN.xml',
    'Infinito-W2-AN.jpg', 'infinito-W2-AN.xml',
    'Infinito-W3-AN.jpg', 'infinito-W3-AN.xml',
    'Infinito-W4-AN.jpg', 'infinito-W4-AN.xml',
    // Sheherazade
    'Sheherazade-tsfolio.xml',
    'Sheherazade-tsfolio-01r.jpg', 'Sheherazade-tsfolio-02r.jpg',
    'Sheherazade-tsq.xml',
    'Sheherazade-tsq-01r.jpg', 'Sheherazade-tsq-02r.jpg', 'Sheherazade-tsq-03r.jpg', 'Sheherazade-tsq-04r.jpg', 'Sheherazade-tsq-05r.jpg'
  ];
  for (const fileName of customFiles) {
    try {
      const response = await fetch(`${base}/documents/${exampleName}/${subfolder}/${fileName}`);
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        const src = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        files.push({
          name: fileName,
          size: blob.size,
          type: blob.type || 'text/plain',
          lastModified: new Date().getTime(),
          src,
          path: `${subfolder}/${fileName}`
        });
      }
    } catch { continue; }
  }
  return files;
}
