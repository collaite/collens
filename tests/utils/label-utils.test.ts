import { describe, test, expect } from 'bun:test';
import { getWitnessLabel, getWitnessType } from '../../src/lib/utils/witness/label-utils';
import type { FileData } from '../../src/lib/stores/indexeddb-store';

/**
 * Test suite for Label Utils
 * Tests the generation of witness labels and type determination
 */
describe('getWitnessLabel', () => {
  test('should convert witness_1 to W1', () => {
    const result = getWitnessLabel('witness_1');
    expect(result).toBe('W1');
  });

  test('should convert witness_2 to W2', () => {
    const result = getWitnessLabel('witness_2');
    expect(result).toBe('W2');
  });

  test('should convert witness_10 to W10', () => {
    const result = getWitnessLabel('witness_10');
    expect(result).toBe('W10');
  });

  test('should convert witness_99 to W99', () => {
    const result = getWitnessLabel('witness_99');
    expect(result).toBe('W99');
  });

  test('should handle single digit witness numbers', () => {
    const result = getWitnessLabel('witness_5');
    expect(result).toBe('W5');
  });

  test('should handle multi-digit witness numbers', () => {
    const result = getWitnessLabel('witness_123');
    expect(result).toBe('W123');
  });

  test('should handle witness_0', () => {
    const result = getWitnessLabel('witness_0');
    expect(result).toBe('W0');
  });

  test('should extract number from witness ID', () => {
    const result = getWitnessLabel('witness_42');
    expect(result).toBe('W42');
  });
});

describe('getWitnessType', () => {
  test('should return "MS" for manuscript files', () => {
    const files: FileData[] = [
      { name: 'ms-1.xml', path: 'folder/ms-1.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('MS');
  });

  test('should return "TS" for typescript files', () => {
    const files: FileData[] = [
      { name: 'ts-1.xml', path: 'folder/ts-1.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('TS');
  });

  test('should return empty string for files without type indicator', () => {
    const files: FileData[] = [
      { name: 'document.xml', path: 'folder/document.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('');
  });

  test('should return "MS" when multiple files contain ms-', () => {
    const files: FileData[] = [
      { name: 'ms-1.xml', path: 'folder/ms-1.xml', src: '', type: 'text/xml' },
      { name: 'ms-2.xml', path: 'folder/ms-2.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('MS');
  });

  test('should return "TS" when multiple files contain ts-', () => {
    const files: FileData[] = [
      { name: 'ts-1.xml', path: 'folder/ts-1.xml', src: '', type: 'text/xml' },
      { name: 'ts-2.xml', path: 'folder/ts-2.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('TS');
  });

  test('should prioritize MS over TS when both exist', () => {
    const files: FileData[] = [
      { name: 'ms-1.xml', path: 'folder/ms-1.xml', src: '', type: 'text/xml' },
      { name: 'ts-1.xml', path: 'folder/ts-1.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('MS');
  });

  test('should handle empty file array', () => {
    const files: FileData[] = [];
    const result = getWitnessType(files);
    expect(result).toBe('');
  });

  test('should detect type from path if not in name', () => {
    const files: FileData[] = [
      { name: 'document.xml', path: 'manuscripts/ms-folder/document.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('MS');
  });

  test('should handle mixed file types', () => {
    const files: FileData[] = [
      { name: 'image.png', path: 'folder/image.png', src: '', type: 'image/png' },
      { name: 'ms-doc.xml', path: 'folder/ms-doc.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('MS');
  });

  test('should return empty string for non-matching patterns', () => {
    const files: FileData[] = [
      { name: 'file1.xml', path: 'path/file1.xml', src: '', type: 'text/xml' },
      { name: 'file2.xml', path: 'path/file2.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    expect(result).toBe('');
  });

  test('should handle case-sensitive matching', () => {
    const files: FileData[] = [
      { name: 'MS-1.xml', path: 'folder/MS-1.xml', src: '', type: 'text/xml' }
    ];
    const result = getWitnessType(files);
    // The function checks for lowercase 'ms-', so uppercase shouldn't match
    expect(result).toBe('');
  });
});
