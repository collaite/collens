import { describe, test, expect } from 'bun:test';
import { cleanTextForComparison } from '../../src/lib/utils/witness/text-cleaner';

/**
 * Test suite for Text Cleaner
 * Tests the cleanup of parsed TEI XML content for comparison purposes
 */
describe('cleanTextForComparison', () => {
  test('should remove XML tags', () => {
    const input = '<p>This is <add>some</add> text</p>';
    const result = cleanTextForComparison(input);
    expect(result).toBe('This is some text');
  });

  test('should remove page markers', () => {
    const input = '[Page 1] This is text [Page 2] More text';
    const result = cleanTextForComparison(input);
    expect(result).toBe('This is text More text');
  });

  test('should normalize whitespace', () => {
    const input = 'This   has    extra     spaces';
    const result = cleanTextForComparison(input);
    expect(result).toBe('This has extra spaces');
  });

  test('should trim leading and trailing whitespace', () => {
    const input = '   Text with spaces   ';
    const result = cleanTextForComparison(input);
    expect(result).toBe('Text with spaces');
  });

  test('should handle empty string', () => {
    const result = cleanTextForComparison('');
    expect(result).toBe('');
  });

  test('should handle text with no XML tags or markers', () => {
    const input = 'Plain text with no markup';
    const result = cleanTextForComparison(input);
    expect(result).toBe('Plain text with no markup');
  });

  test('should handle complex nested XML', () => {
    const input = '<div><p>Text <add>with <del>nested</del> tags</add></p></div>';
    const result = cleanTextForComparison(input);
    expect(result).toBe('Text with nested tags');
  });

  test('should handle multiple page markers', () => {
    const input = '[Page 1] First page [Page 2] Second page [Page 10] Tenth page';
    const result = cleanTextForComparison(input);
    expect(result).toBe('First page Second page Tenth page');
  });

  test('should handle newlines and tabs as whitespace', () => {
    const input = 'Text\n\twith\nnewlines\tand\ttabs';
    const result = cleanTextForComparison(input);
    expect(result).toBe('Text with newlines and tabs');
  });

  test('should handle combination of XML tags, page markers, and whitespace', () => {
    const input = '<p>  [Page 1]  This   is  <add>complex</add>   text  </p>';
    const result = cleanTextForComparison(input);
    expect(result).toBe('This is complex text');
  });

  test('should preserve special characters in text content', () => {
    const input = '<p>Text with special chars: é, ñ, ü, ₰</p>';
    const result = cleanTextForComparison(input);
    expect(result).toBe('Text with special chars: é, ñ, ü, ₰');
  });

  test('should handle self-closing XML tags', () => {
    const input = 'Text before<lb/>text after';
    const result = cleanTextForComparison(input);
    expect(result).toBe('Text beforetext after');
  });
});
