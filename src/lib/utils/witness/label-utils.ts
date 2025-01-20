import type { FileData } from '$lib/stores/indexeddb-store';

export function getWitnessLabel(witnessId: string): string {
  // Extract witness number from the ID
  const num = witnessId.replace('witness_', '');
  // Determine witness type from the ID number
  // This matches the logic in the store
  return `W${num}`;
}

export function getWitnessType(files: FileData[]): string {
  return files.some(file => file.path.includes('ms-')) ? 'MS' :
    files.some(file => file.path.includes('ts-')) ? 'TS' : '';
}
