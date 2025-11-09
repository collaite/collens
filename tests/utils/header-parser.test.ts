import { describe, test, expect } from 'bun:test';
import { parseTEIHeader } from '../../src/lib/utils/witness/header-parser';

/**
 * Test suite for Header Parser
 * Tests the parsing of TEI header metadata from XML documents
 */
describe('parseTEIHeader', () => {
  const simpleHeader = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Test Document</title>
        <author>Test Author</author>
      </titleStmt>
    </fileDesc>
  </teiHeader>
</TEI>`;

  const complexHeader = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Main Title</title>
        <author>Primary Author</author>
        <editor>Editor Name</editor>
      </titleStmt>
      <publicationStmt>
        <publisher>Test Publisher</publisher>
        <date>2024</date>
      </publicationStmt>
    </fileDesc>
    <revisionDesc>
      <change>First revision</change>
      <change>Second revision</change>
    </revisionDesc>
  </teiHeader>
</TEI>`;

  const nestedHeader = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Document Title</title>
        <respStmt>
          <resp>Transcription</resp>
          <name>Transcriber Name</name>
        </respStmt>
      </titleStmt>
    </fileDesc>
  </teiHeader>
</TEI>`;

  const headerWithDirectText = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      Direct text content
      <titleStmt>
        <title>Title with direct text parent</title>
      </titleStmt>
    </fileDesc>
  </teiHeader>
</TEI>`;

  test('should return empty array for empty input', () => {
    const result = parseTEIHeader('');
    expect(result).toEqual([]);
  });

  test('should parse simple header structure', () => {
    const result = parseTEIHeader(simpleHeader);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].tag).toBe('File  Desc');
    expect(result[0].level).toBe(0);
  });

  test('should format tag names correctly', () => {
    const result = parseTEIHeader(simpleHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    expect(fileDesc).toBeDefined();

    const titleStmt = fileDesc?.children.find(child => child.tag === 'Title  Stmt');
    expect(titleStmt).toBeDefined();
  });

  test('should extract title content', () => {
    const result = parseTEIHeader(simpleHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    const titleStmt = fileDesc?.children.find(child => child.tag === 'Title  Stmt');
    const title = titleStmt?.children.find(child => child.tag === 'Title');

    expect(title?.content).toBe('Test Document');
  });

  test('should extract author content', () => {
    const result = parseTEIHeader(simpleHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    const titleStmt = fileDesc?.children.find(child => child.tag === 'Title  Stmt');
    const author = titleStmt?.children.find(child => child.tag === 'Author');

    expect(author?.content).toBe('Test Author');
  });

  test('should handle multiple children at same level', () => {
    const result = parseTEIHeader(complexHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');

    expect(fileDesc?.children.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(fileDesc?.children.some(child => child.tag === 'Title  Stmt')).toBe(true);
    expect(fileDesc?.children.some(child => child.tag === 'Publication  Stmt')).toBe(true);
  });

  test('should maintain correct nesting levels', () => {
    const result = parseTEIHeader(simpleHeader);

    // Root level (fileDesc)
    expect(result[0].level).toBe(0);

    // Second level (titleStmt)
    expect(result[0].children[0].level).toBe(1);

    // Third level (title, author)
    expect(result[0].children[0].children[0].level).toBe(2);
  });

  test('should handle nested responsibility statements', () => {
    const result = parseTEIHeader(nestedHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    const titleStmt = fileDesc?.children.find(child => child.tag === 'Title  Stmt');
    const respStmt = titleStmt?.children.find(child => child.tag === 'Resp  Stmt');

    expect(respStmt).toBeDefined();
    expect(respStmt?.children.length ?? 0).toBeGreaterThan(0);
  });

  test('should extract only direct text content', () => {
    const result = parseTEIHeader(headerWithDirectText);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');

    // Should have direct text but not include child element text
    expect(fileDesc?.content ?? '').toContain('Direct text content');
    expect(fileDesc?.content ?? '').not.toContain('Title with direct text parent');
  });

  test('should handle revision descriptions', () => {
    const result = parseTEIHeader(complexHeader);
    const revisionDesc = result.find(entry => entry.tag === 'Revision  Desc');

    expect(revisionDesc).toBeDefined();
    expect(revisionDesc?.children.length).toBe(2);
  });

  test('should handle invalid XML gracefully', () => {
    const invalidXML = '<invalid><unclosed>';
    const result = parseTEIHeader(invalidXML);
    expect(result).toEqual([]);
  });

  test('should handle XML without teiHeader', () => {
    const noHeaderXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Content without header</p>
    </body>
  </text>
</TEI>`;
    const result = parseTEIHeader(noHeaderXML);
    expect(result).toEqual([]);
  });

  test('should handle empty teiHeader', () => {
    const emptyHeaderXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
  </teiHeader>
</TEI>`;
    const result = parseTEIHeader(emptyHeaderXML);
    expect(result).toEqual([]);
  });

  test('should handle multiple top-level header elements', () => {
    const result = parseTEIHeader(complexHeader);

    // Should have fileDesc and revisionDesc at top level
    expect(result.length).toBe(2);
    expect(result.some(entry => entry.tag === 'File  Desc')).toBe(true);
    expect(result.some(entry => entry.tag === 'Revision  Desc')).toBe(true);
  });

  test('should preserve hierarchical structure', () => {
    const result = parseTEIHeader(complexHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    const titleStmt = fileDesc?.children.find(child => child.tag === 'Title  Stmt');

    expect(titleStmt?.children.length).toBe(3); // title, author, editor
  });

  test('should handle whitespace in text content', () => {
    const whiteSpaceHeader = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>   Title with spaces   </title>
      </titleStmt>
    </fileDesc>
  </teiHeader>
</TEI>`;
    const result = parseTEIHeader(whiteSpaceHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    const titleStmt = fileDesc?.children.find(child => child.tag === 'Title  Stmt');
    const title = titleStmt?.children.find(child => child.tag === 'Title');

    expect(title?.content).toBe('Title with spaces');
  });

  test('should handle publication statement details', () => {
    const result = parseTEIHeader(complexHeader);
    const fileDesc = result.find(entry => entry.tag === 'File  Desc');
    const pubStmt = fileDesc?.children.find(child => child.tag === 'Publication  Stmt');

    expect(pubStmt).toBeDefined();

    const publisher = pubStmt?.children.find(child => child.tag === 'Publisher');
    const date = pubStmt?.children.find(child => child.tag === 'Date');

    expect(publisher?.content).toBe('Test Publisher');
    expect(date?.content).toBe('2024');
  });

  test('should handle camelCase tag formatting', () => {
    const camelCaseHeader = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <encodingDesc>
      <projectDesc>
        <p>Project description</p>
      </projectDesc>
    </encodingDesc>
  </teiHeader>
</TEI>`;
    const result = parseTEIHeader(camelCaseHeader);
    const encodingDesc = result.find(entry => entry.tag === 'Encoding  Desc');

    expect(encodingDesc).toBeDefined();

    const projectDesc = encodingDesc?.children.find(child => child.tag === 'Project  Desc');
    expect(projectDesc).toBeDefined();
  });
});
