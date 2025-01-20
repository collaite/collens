import type { Folder, FileData } from '$lib/stores/indexeddb-store';

/**
 * File Utils Module
 * This module provides utilities for handling files in the witness system,
 * particularly focusing on extracting information from filenames and loading
 * XML content from witness folders.
 */

/**
 * Extracts and formats the page number from a witness file name.
 * Supports various file naming patterns commonly found in manuscript digitization.
 *
 * Supported patterns:
 * - Simple numbered files (e.g., "1.png")
 * - Files with page indicators (e.g., "something-01r.jpg")
 * - Any filename containing numbers
 *
 * Features:
 * - Pads single digit numbers with leading zero
 * - Handles various image file extensions
 * - Falls back to first number found if no specific pattern matches
 *
 * @param file - The file object containing name and path information
 * @returns Formatted page number string (padded with leading zero if needed)
 *
 * Examples:
 * - "1.png" -> "01"
 * - "page-1.jpg" -> "01"
 * - "manuscript-01r.jpg" -> "01"
 */
export function getPageNumber(file: FileData): string {
  // Try to match different number patterns in filenames
  const patterns = [
    /(\d+)\.(?:png|jpg|jpeg|webp|tiff|avif)$/i,  // Simple numbered files like "1.png"
    /-(\d+)r?\./i,  // Files like "something-01r.jpg" or "something-1.jpg"
    /(\d+)/  // Fallback: just get the first number in the filename
  ];

  for (const pattern of patterns) {
    const match = file.name.match(pattern);
    if (match) {
      // Pad single digit numbers with leading zero for correct string sorting
      const num = match[1];
      return num.length === 1 ? '0' + num : num;
    }
  }
  return '';
}

/**
 * Loads and retrieves the XML content from a witness folder.
 * This function finds the XML file in a folder and loads its content,
 * which typically contains the TEI transcription of the witness.
 *
 * Features:
 * - Automatically finds XML files in the folder
 * - Handles data URL content (common in browser storage)
 * - Provides error handling for failed loads
 *
 * Error Handling:
 * - Returns null if no XML file found
 * - Returns null if content cannot be loaded
 * - Logs errors to console for debugging
 *
 * @param folder - The folder object containing witness files
 * @returns Promise resolving to the XML content string or null if not found/loadable
 */
export async function loadXMLContent(folder: Folder): Promise<string | null> {
  // Find XML file in the folder
  const xmlFile = folder.files.find((f) => f.name.endsWith('.xml'));
  if (!xmlFile) return null;

  try {
    // Since the file content is stored as a data URL in src, we need to fetch it
    const response = await fetch(xmlFile.src);
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error loading XML content:', error);
    return null;
  }
}
