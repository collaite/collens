import { describe, test, expect } from 'bun:test';
import { getWitnessStats } from '../../src/lib/utils/witness/stats-utils';

/**
 * Test suite for Stats Utils
 * Tests the calculation of editorial statistics from TEI XML documents
 */
describe('getWitnessStats', () => {
  const sampleXMLWithStats = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>This is <add>added</add> text with <del>deleted</del> content.</p>
      <p>Another <add>addition</add> and <del>deletion</del> here.</p>
      <p>A <subst><del>substitution</del><add>replacement</add></subst> example.</p>
      <p>Text with <transpose>transposed content</transpose>.</p>
    </body>
  </text>
</TEI>`;

  const xmlNoEdits = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Plain text with no edits.</p>
    </body>
  </text>
</TEI>`;

  const xmlOnlyAdditions = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Text with <add>first</add> and <add>second</add> and <add>third</add> additions.</p>
    </body>
  </text>
</TEI>`;

  const xmlOnlyDeletions = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Text with <del>first</del> and <del>second</del> deletions.</p>
    </body>
  </text>
</TEI>`;

  const xmlNestedEdits = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Text with <add>outer <del>nested deletion</del> addition</add>.</p>
    </body>
  </text>
</TEI>`;

  const xmlMultipleSubstitutions = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>First <subst><del>old1</del><add>new1</add></subst> here.</p>
      <p>Second <subst><del>old2</del><add>new2</add></subst> there.</p>
      <p>Third <subst><del>old3</del><add>new3</add></subst> everywhere.</p>
    </body>
  </text>
</TEI>`;

  test('should return zero counts for empty input', () => {
    const result = getWitnessStats('');
    expect(result).toEqual({
      additions: 0,
      deletions: 0,
      substitutions: 0,
      transpositions: 0
    });
  });

  test('should count additions correctly', () => {
    const result = getWitnessStats(xmlOnlyAdditions);
    expect(result.additions).toBe(3);
    expect(result.deletions).toBe(0);
    expect(result.substitutions).toBe(0);
    expect(result.transpositions).toBe(0);
  });

  test('should count deletions correctly', () => {
    const result = getWitnessStats(xmlOnlyDeletions);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(2);
    expect(result.substitutions).toBe(0);
    expect(result.transpositions).toBe(0);
  });

  test('should count all edit types', () => {
    const result = getWitnessStats(sampleXMLWithStats);
    expect(result.additions).toBe(3); // 2 standalone + 1 in subst
    expect(result.deletions).toBe(3); // 2 standalone + 1 in subst
    expect(result.substitutions).toBe(1);
    expect(result.transpositions).toBe(1);
  });

  test('should return zero counts for text with no edits', () => {
    const result = getWitnessStats(xmlNoEdits);
    expect(result).toEqual({
      additions: 0,
      deletions: 0,
      substitutions: 0,
      transpositions: 0
    });
  });

  test('should count nested edits separately', () => {
    const result = getWitnessStats(xmlNestedEdits);
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
  });

  test('should count multiple substitutions', () => {
    const result = getWitnessStats(xmlMultipleSubstitutions);
    expect(result.substitutions).toBe(3);
    expect(result.additions).toBe(3); // One in each subst
    expect(result.deletions).toBe(3); // One in each subst
  });

  test('should handle invalid XML gracefully', () => {
    const invalidXML = '<invalid><unclosed>';
    const result = getWitnessStats(invalidXML);
    expect(result).toEqual({
      additions: 0,
      deletions: 0,
      substitutions: 0,
      transpositions: 0
    });
  });

  test('should handle XML without text element', () => {
    const noTextXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt><title>Test</title></titleStmt>
    </fileDesc>
  </teiHeader>
</TEI>`;
    const result = getWitnessStats(noTextXML);
    expect(result).toEqual({
      additions: 0,
      deletions: 0,
      substitutions: 0,
      transpositions: 0
    });
  });

  test('should handle edits in different document sections', () => {
    const multiSectionXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <div>
        <p>Section 1 <add>addition</add></p>
      </div>
      <div>
        <p>Section 2 <del>deletion</del></p>
      </div>
      <div>
        <p>Section 3 <subst><del>old</del><add>new</add></subst></p>
      </div>
    </body>
  </text>
</TEI>`;
    const result = getWitnessStats(multiSectionXML);
    expect(result.additions).toBe(2);
    expect(result.deletions).toBe(2);
    expect(result.substitutions).toBe(1);
  });

  test('should handle complex nested structures', () => {
    const complexXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>
        <subst>
          <del>
            <add>nested add in del in subst</add>
          </del>
          <add>replacement</add>
        </subst>
      </p>
    </body>
  </text>
</TEI>`;
    const result = getWitnessStats(complexXML);
    expect(result.substitutions).toBe(1);
    expect(result.additions).toBe(2); // Both nested and in subst
    expect(result.deletions).toBe(1);
  });
});
