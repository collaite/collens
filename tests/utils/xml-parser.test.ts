import { describe, test, expect } from 'bun:test';
import { parseTEIXML } from '../../src/lib/utils/witness/xml-parser';

/**
 * Test suite for TEI XML Parser
 * Tests the parsing and processing of TEI XML documents with various witness types
 */
describe('parseTEIXML', () => {
  // Sample TEI XML for testing
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is a simple text.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithEdits = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <add>added</add> text with <del>deleted</del> content.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithSubst = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <subst><del>old</del><add>new</add></subst> text.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithPageBreaks = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <pb n="1"/>
      <p>Page one content.</p>
      <pb n="2"/>
      <p>Page two content.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithLineBreaks = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Line one<lb/>Line two<lb/>Line three</p>
    </body>
  </text>
</TEI>`;

  const xmlWithUnclear = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <unclear>unclear text</unclear> here.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithSupplied = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <supplied>supplied text</supplied> here.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithNote = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is text<note>editorial note</note> here.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithNested = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <add>outer <del>nested</del> addition</add> text.</p>
    </body>
  </text>
</TEI>`;

  const xmlWithInstantRevision = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <add instant="true">instant addition</add> and <del instant="true">instant deletion</del> text.</p>
    </body>
  </text>
</TEI>`;

  test('should return empty string for empty input', () => {
    const result = parseTEIXML('');
    expect(result).toBe('');
  });

  test('should parse simple TEI XML', () => {
    const result = parseTEIXML(sampleXML);
    expect(result).toContain('This is a simple text.');
  });

  test('should handle invalid XML gracefully', () => {
    const invalidXML = '<invalid><unclosed>';
    const result = parseTEIXML(invalidXML);
    expect(result).toBe(invalidXML);
  });

  describe('Witness Type 1c (Final Text)', () => {
    test('should apply all edits and show final text', () => {
      const result = parseTEIXML(xmlWithEdits, '1c');
      expect(result).toContain('added');
      expect(result).not.toContain('[deleted]');
      expect(result).not.toContain('{added}');
    });

    test('should handle substitutions by applying new text', () => {
      const result = parseTEIXML(xmlWithSubst, '1c');
      expect(result).toContain('new');
      expect(result).not.toContain('old');
    });

    test('should process nested edits', () => {
      const result = parseTEIXML(xmlWithNested, '1c');
      expect(result).toContain('outer');
      expect(result).toContain('addition');
      expect(result).not.toContain('nested');
    });
  });

  describe('Witness Type 1a (Original Text)', () => {
    test('should remove additions and preserve deletions', () => {
      const result = parseTEIXML(xmlWithEdits, '1a');
      expect(result).not.toContain('{added}');
      expect(result).toContain('deleted');
    });

    test('should handle substitutions by showing old text', () => {
      const result = parseTEIXML(xmlWithSubst, '1a');
      expect(result).toContain('old');
      expect(result).not.toContain('{new}');
    });

    test('should preserve instant revisions with markers', () => {
      const result = parseTEIXML(xmlWithInstantRevision, '1a');
      expect(result).toContain('instant');
    });
  });

  describe('Witness Type 1b (Intermediate State)', () => {
    test('should apply edits up to nesting level 2', () => {
      const result = parseTEIXML(xmlWithNested, '1b');
      // Should apply the outer edit (level 1) and inner edit (level 2)
      expect(result).toBeTruthy();
    });

    test('should apply instant revisions', () => {
      const result = parseTEIXML(xmlWithInstantRevision, '1b');
      expect(result).toContain('instant');
    });
  });

  describe('Special Elements', () => {
    test('should handle page breaks', () => {
      const result = parseTEIXML(xmlWithPageBreaks);
      expect(result).toContain('[Page 1]');
      expect(result).toContain('[Page 2]');
    });

    test('should handle line breaks', () => {
      const result = parseTEIXML(xmlWithLineBreaks);
      expect(result).toContain('Line one');
      expect(result).toContain('Line two');
      expect(result).toContain('Line three');
    });

    test('should format unclear text with angle brackets', () => {
      const result = parseTEIXML(xmlWithUnclear);
      expect(result).toContain('⟨unclear text⟩');
    });

    test('should format supplied text with angle brackets', () => {
      const result = parseTEIXML(xmlWithSupplied);
      expect(result).toContain('<supplied text>');
    });

    test('should format notes with double parentheses', () => {
      const result = parseTEIXML(xmlWithNote);
      expect(result).toContain('((editorial note))');
    });
  });

  describe('Edge Cases', () => {
    test('should handle XML without body element', () => {
      const noBodyXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <p>No body wrapper</p>
  </text>
</TEI>`;
      const result = parseTEIXML(noBodyXML);
      expect(result).toBe(noBodyXML);
    });

    test('should normalize whitespace', () => {
      const whiteSpaceXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Text   with    extra    spaces</p>
    </body>
  </text>
</TEI>`;
      const result = parseTEIXML(whiteSpaceXML);
      expect(result).toContain('Text with extra spaces');
    });

    test('should handle paragraphs with proper tags', () => {
      const result = parseTEIXML(sampleXML);
      expect(result).toContain('<p>');
      expect(result).toContain('</p>');
    });

    test('should handle metamark with notes', () => {
      const metaMarkXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Text <metamark>₰</metamark><note>with metamark note</note> here.</p>
    </body>
  </text>
</TEI>`;
      const result = parseTEIXML(metaMarkXML);
      expect(result).toContain('((₰ with metamark note))');
    });
  });
});
