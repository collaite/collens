import type { FileData } from '$lib/stores/indexeddb-store';

/**
 * Label Utils Module
 * This module provides utilities for generating and determining witness labels
 * and types. It helps maintain consistent witness identification throughout
 * the application.
 */

/**
 * Generates a standardized label for a witness based on its ID.
 * Converts witness_X format to WX format for display purposes.
 *
 * Features:
 * - Extracts numeric identifier from witness ID
 * - Maintains consistent labeling format
 * - Matches store logic for witness identification
 *
 * @param witnessId - The full witness identifier (e.g., "witness_1")
 * @returns Formatted witness label (e.g., "W1")
 *
 * Examples:
 * - "witness_1" -> "W1"
 * - "witness_2" -> "W2"
 */
export function getWitnessLabel(witnessId: string): string {
  // Extract witness number from the ID
  const num = witnessId.replace('witness_', '');
  // Determine witness type from the ID number
  // This matches the logic in the store
  return `W${num}`;
}

/**
 * Determines the type of witness based on its files.
 * Analyzes file paths to identify if the witness is a manuscript (MS)
 * or typescript (TS) version.
 *
 * Features:
 * - Detects manuscript files (prefixed with 'ms-')
 * - Detects typescript files (prefixed with 'ts-')
 * - Returns empty string if type cannot be determined
 *
 * @param files - Array of files associated with the witness
 * @returns Witness type identifier ("MS", "TS", or "")
 *
 * Examples:
 * - Files containing "ms-" -> "MS"
 * - Files containing "ts-" -> "TS"
 * - Files with no type indicator -> ""
 */
export function getWitnessType(files: FileData[]): string {
  return files.some(file => file.path.includes('ms-')) ? 'MS' :
    files.some(file => file.path.includes('ts-')) ? 'TS' : '';
}
