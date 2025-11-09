import { describe, test, expect } from 'bun:test';
import { getPageNumber } from '../../src/lib/utils/witness/file-utils';
import type { FileData } from '../../src/lib/stores/indexeddb-store';

/**
 * Test suite for File Utils
 * Tests file handling utilities including page number extraction
 */
describe('getPageNumber', () => {
  test('should extract and pad single digit from simple numbered file', () => {
    const file: FileData = {
      name: '1.png',
      path: 'folder/1.png',
      src: '',
      type: 'image/png'
    };
    const result = getPageNumber(file);
    expect(result).toBe('01');
  });

  test('should extract double digit without padding', () => {
    const file: FileData = {
      name: '12.jpg',
      path: 'folder/12.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('12');
  });

  test('should handle page number with r suffix', () => {
    const file: FileData = {
      name: 'page-01r.jpg',
      path: 'folder/page-01r.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('01');
  });

  test('should handle various image extensions - PNG', () => {
    const file: FileData = {
      name: '5.PNG',
      path: 'folder/5.PNG',
      src: '',
      type: 'image/png'
    };
    const result = getPageNumber(file);
    expect(result).toBe('05');
  });

  test('should handle various image extensions - JPEG', () => {
    const file: FileData = {
      name: '3.jpeg',
      path: 'folder/3.jpeg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('03');
  });

  test('should handle various image extensions - WebP', () => {
    const file: FileData = {
      name: '7.webp',
      path: 'folder/7.webp',
      src: '',
      type: 'image/webp'
    };
    const result = getPageNumber(file);
    expect(result).toBe('07');
  });

  test('should handle various image extensions - TIFF', () => {
    const file: FileData = {
      name: '9.tiff',
      path: 'folder/9.tiff',
      src: '',
      type: 'image/tiff'
    };
    const result = getPageNumber(file);
    expect(result).toBe('09');
  });

  test('should handle various image extensions - AVIF', () => {
    const file: FileData = {
      name: '4.avif',
      path: 'folder/4.avif',
      src: '',
      type: 'image/avif'
    };
    const result = getPageNumber(file);
    expect(result).toBe('04');
  });

  test('should extract from file with prefix and hyphen', () => {
    const file: FileData = {
      name: 'manuscript-5.jpg',
      path: 'folder/manuscript-5.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('05');
  });

  test('should extract from file with multiple hyphens', () => {
    const file: FileData = {
      name: 'ms-page-10.jpg',
      path: 'folder/ms-page-10.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('10');
  });

  test('should handle file with leading zeros', () => {
    const file: FileData = {
      name: 'page-001.jpg',
      path: 'folder/page-001.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('001');
  });

  test('should use fallback pattern for complex names', () => {
    const file: FileData = {
      name: 'complex_name_15_version.jpg',
      path: 'folder/complex_name_15_version.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('15');
  });

  test('should return empty string for files without numbers', () => {
    const file: FileData = {
      name: 'image.jpg',
      path: 'folder/image.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('');
  });

  test('should handle three digit page numbers', () => {
    const file: FileData = {
      name: '123.png',
      path: 'folder/123.png',
      src: '',
      type: 'image/png'
    };
    const result = getPageNumber(file);
    expect(result).toBe('123');
  });

  test('should pad zero correctly', () => {
    const file: FileData = {
      name: '0.jpg',
      path: 'folder/0.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('00');
  });

  test('should extract number from hyphen pattern when multiple numbers exist', () => {
    const file: FileData = {
      name: 'page-5-version-2.jpg',
      path: 'folder/page-5-version-2.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    // The function matches the hyphen pattern which finds the last hyphenated number
    expect(result).toBe('02');
  });

  test('should handle files with underscore separator', () => {
    const file: FileData = {
      name: 'page_8.jpg',
      path: 'folder/page_8.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('08');
  });

  test('should handle manuscript naming convention', () => {
    const file: FileData = {
      name: 'ms-01r.jpg',
      path: 'manuscripts/witness1/ms-01r.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('01');
  });

  test('should handle typescript naming convention', () => {
    const file: FileData = {
      name: 'ts-02.jpg',
      path: 'typescripts/witness1/ts-02.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('02');
  });

  test('should handle case-insensitive file extensions', () => {
    const file: FileData = {
      name: '6.JPG',
      path: 'folder/6.JPG',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('06');
  });

  test('should handle files with dots in name', () => {
    const file: FileData = {
      name: 'page.version.3.jpg',
      path: 'folder/page.version.3.jpg',
      src: '',
      type: 'image/jpeg'
    };
    const result = getPageNumber(file);
    expect(result).toBe('03');
  });
});
