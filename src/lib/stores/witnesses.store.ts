/**
 * Witnesses Store Module
 * This module manages the state and operations for witness documents in the application.
 * It provides functionality for loading, managing, and manipulating witness data,
 * including their files, metrics, and visibility states.
 */

import { writable } from 'svelte/store';
import type { Folder, FileData } from './indexeddb-store';
import { loadXMLContent, getWitnessStats, type WitnessStats } from '$lib/utils/witness';

/**
 * Represents a complete witness document with its associated data.
 * A witness is a version of a document that contains both the transcription
 * and associated image files.
 */
export interface Witness {
  /** The folder containing all witness files */
  folder: Folder;
  /** Currently selected file in the witness viewer */
  selectedFile: FileData | undefined;
  /** Whether the witness is currently visible in the interface */
  enabled: boolean;
  /** Statistical metrics about the witness's editorial changes */
  metrics: WitnessStats;
}

/**
 * Creates a new witnesses store with a complete set of witness management operations.
 * This store is the central point for managing witness data in the application.
 *
 * Store Functionality:
 * - Maintains a list of all witnesses
 * - Provides methods for witness manipulation
 * - Handles witness file management
 * - Manages witness visibility states
 *
 * @returns An object containing:
 * - subscribe: Svelte store subscription function
 * - getWitnessesFromDocument: Function to load witnesses from a document
 * - getImageFiles: Function to get image files from a folder
 * - updateWitnessFile: Function to update selected file in a witness
 * - toggleWitness: Function to toggle witness visibility
 */
function createWitnessesStore() {
  const { subscribe, set, update } = writable<Witness[]>([]);

  /**
   * Checks if a file is an image based on its MIME type.
   * Supports common image formats used in manuscript digitization.
   *
   * @param file - The file to check
   * @returns True if the file is a supported image type
   */
  function isImageFile(file: FileData): boolean {
    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff', 'image/avif'];
    return imageTypes.includes(file.type);
  }

  /**
   * Retrieves all image files from a folder.
   * Filters the folder's files to return only supported image types.
   *
   * @param folder - The folder to search for images
   * @returns Array of image files found in the folder
   */
  function getImageFiles(folder: Folder): FileData[] {
    return (folder.files || []).filter(isImageFile);
  }

  /**
   * Processes a document folder to extract and configure its witnesses.
   * This is the main function for initializing witness data from a document.
   *
   * Processing Steps:
   * 1. Groups files by witness directory
   * 2. Determines witness types (MS/TS)
   * 3. Sets up initial file selection
   * 4. Loads and processes XML content
   * 5. Calculates witness metrics
   *
   * @param document - The document folder to process
   * @returns Promise resolving to array of configured witnesses
   */
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

  /**
   * Updates the selected file for a specific witness.
   * Used when navigating through witness images or selecting specific pages.
   *
   * @param witnessId - ID of the witness to update
   * @param file - New file to select
   */
  function updateWitnessFile(witnessId: string, file: FileData) {
    update(witnesses => {
      const witness = witnesses.find(w => w.folder.id === witnessId);
      if (witness) {
        witness.selectedFile = file;
      }
      return witnesses;
    });
  }

  /**
   * Toggles the visibility state of a witness.
   * Controls whether a witness is displayed in the interface.
   *
   * @param id - ID of the witness to toggle
   */
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

/**
 * The main witnesses store instance.
 * This is the primary access point for witness management functionality
 * throughout the application.
 *
 * Usage:
 * ```typescript
 * // Subscribe to witness changes
 * witnessesStore.subscribe(witnesses => {
 *   // Handle witness updates
 * });
 *
 * // Load witnesses from a document
 * await witnessesStore.getWitnessesFromDocument(documentFolder);
 *
 * // Toggle witness visibility
 * witnessesStore.toggleWitness('witness_1');
 * ```
 */
export const witnessesStore = createWitnessesStore();
