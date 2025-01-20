import { writable } from 'svelte/store';
import type { Folder, FileData } from './indexeddb-store';
import { loadXMLContent, getWitnessStats, type WitnessStats } from '$lib/utils/witness';

export interface Witness {
  folder: Folder;
  selectedFile: FileData | undefined;
  enabled: boolean;
  metrics: WitnessStats;
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

  async function getWitnessesFromDocument(document: Folder): Promise<Witness[]> {
    // Group files by witness
    const witnessFolders = new Map<string, FileData[]>();

    // Group files by their first directory name, ignoring root level files
    document.files.forEach((file) => {
      // Only process files that are inside directories (contain a forward slash)
      if (file.path.includes('/')) {
        // Get the first directory name from the path
        const dirName = file.path.split('/')[0];
        if (!witnessFolders.has(dirName)) {
          witnessFolders.set(dirName, []);
        }
        witnessFolders.get(dirName)?.push(file);
      }
    });

    // Create witness folders using actual directory names
    const witnesses = await Promise.all(
      Array.from(witnessFolders.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(async ([dirName, files]) => {
          // Determine witness type from files
          const witnessType = files.some(file => file.path.includes('ms-')) ? 'MS' :
            files.some(file => file.path.includes('ts-')) ? 'TS' : '';

          const folder: Folder = {
            id: dirName,
            files,
            title: witnessType ? `${witnessType} Version` : dirName,
            description: ''
          };

          // Find first image file for initial selection
          const imageFiles = getImageFiles(folder);
          const selectedFile = imageFiles.length > 0 ? imageFiles[0] : undefined;

          // Load XML content and calculate metrics
          const xmlContent = await loadXMLContent(folder);
          const metrics = xmlContent ? getWitnessStats(xmlContent) : {
            additions: 0,
            deletions: 0,
            substitutions: 0,
            transpositions: 0
          };

          return {
            folder,
            selectedFile,
            enabled: true,
            metrics
          };
        })
    );

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
    update(witnesses => {
      const witness = witnesses.find(w => w.folder.id === id);
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
