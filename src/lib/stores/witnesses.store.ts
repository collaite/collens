import { writable } from 'svelte/store';
import type { Folder, FileData } from './indexeddb-store';

export interface Witness {
  folder: Folder;
  selectedFile: FileData | undefined;
  enabled: boolean;
}

function createWitnessesStore() {
  const { subscribe, set, update } = writable<Witness[]>([]);

  function isImageFile(file: FileData): boolean {
    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff', 'image/avif'];
    return imageTypes.includes(file.type);
  }

  function getImageFiles(folder: Folder): FileData[] {
    return (folder.files || []).filter(isImageFile);
  }

  function getWitnessesFromDocument(document: Folder): Witness[] {
    // Group files by witness
    const witnessFolders = new Map<string, FileData[]>();

    document.files.forEach((file) => {
      const witnessMatch = file.path.match(/witness_(\d+)/);
      if (witnessMatch) {
        const witnessId = witnessMatch[1];
        if (!witnessFolders.has(witnessId)) {
          witnessFolders.set(witnessId, []);
        }
        witnessFolders.get(witnessId)?.push(file);
      }
    });

    // Create witness folders and sort by witness ID
    const witnesses = Array.from(witnessFolders.entries())
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([witnessId, files]) => {
        const folder: Folder = {
          id: `witness_${witnessId}`,
          files,
          title: `Witness ${witnessId}`,
          description: ''
        };

        // Find first image file for initial selection
        const imageFiles = getImageFiles(folder);
        const selectedFile = imageFiles.length > 0 ? imageFiles[0] : undefined;

        return {
          folder,
          selectedFile,
          enabled: true
        };
      });

    set(witnesses);
    return witnesses;
  }

  function updateWitnessFile(witnessId: string, file: FileData) {
    update(witnesses => {
      const witness = witnesses.find(w => w.folder.id === witnessId);
      if (witness) {
        witness.selectedFile = file;
      }
      return witnesses;
    });
  }

  function toggleWitness(id: string) {
    const witnessId = `witness_${id}`;
    update(witnesses => {
      const witness = witnesses.find(w => w.folder.id === witnessId);
      if (witness) {
        witness.enabled = !witness.enabled;
      }
      return witnesses;
    });
  }

  return {
    subscribe,
    getWitnessesFromDocument,
    getImageFiles,
    updateWitnessFile,
    toggleWitness
  };
}

export const witnessesStore = createWitnessesStore();
