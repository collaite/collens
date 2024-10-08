import { persisted } from 'svelte-persisted-store';

export interface ImageData {
  name: string;
  src: string;
}

export interface FolderData {
  id: string;
  images: ImageData[];
}

export const foldersStore = persisted<FolderData[]>('folders', []);

export function removeFolder(id: string) {
  foldersStore.update((folders) => folders.filter((folder) => folder.id !== id));
}